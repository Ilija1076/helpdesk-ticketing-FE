'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchComments, postComment } from '@/lib/api/browser-client';
import type { AuthUser, Comment, Paginated } from '@/lib/api/types';
import { formatDateTime } from '@/lib/sla';
import { cn } from '@/lib/utils';

const REFETCH_INTERVAL_MS = 30_000;

export function CommentThread({
  ticketId,
  user,
  initialData,
}: {
  ticketId: string;
  user: AuthUser;
  initialData: Paginated<Comment>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ['comments', ticketId];

  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data, error } = useQuery({
    queryKey,
    queryFn: () => fetchComments(ticketId),
    // Rendered on the server first, so the thread is in the HTML rather than appearing
    // after hydration.
    initialData,
    // Picks up the other party's replies without the user reloading.
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (error instanceof Error && error.message === 'Session expired') {
      router.push(`/login?next=/tickets/${ticketId}`);
    }
  }, [error, router, ticketId]);

  const mutation = useMutation({
    mutationFn: (input: { body: string; isInternal: boolean }) => postComment(ticketId, input),

    async onMutate(input) {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Paginated<Comment>>(queryKey);

      const optimistic: Comment = {
        id: `optimistic-${crypto.randomUUID()}`,
        ticketId,
        body: input.body,
        isInternal: input.isInternal,
        author: user,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Paginated<Comment>>(queryKey, (current) =>
        current
          ? {
              ...current,
              data: [...current.data, optimistic],
              meta: { ...current.meta, total: current.meta.total + 1 },
            }
          : current,
      );

      return { previous, optimisticId: optimistic.id };
    },

    onError(_error, _input, context) {
      // Put the thread back exactly as it was, and the text back in the box so the
      // user does not lose what they typed.
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },

    onSuccess() {
      setBody('');
      setIsInternal(false);
      // A first agent reply stops the first-response SLA clock, which is rendered by the
      // server component above this one.
      router.refresh();
    },

    onSettled() {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const comments = data?.data ?? [];
  const canSubmit = body.trim().length > 0 && !mutation.isPending;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {comments.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              isPending={comment.id.startsWith('optimistic-')}
            />
          ))
        )}
      </div>

      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) return;
          mutation.mutate({ body: body.trim(), isInternal });
        }}
      >
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={isInternal ? 'Internal note, hidden from the requester…' : 'Add a comment…'}
          rows={3}
          aria-label="Comment body"
        />

        {mutation.isError ? (
          <p role="alert" className="text-destructive text-sm">
            {(mutation.error as Error).message}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          {user.role === 'AGENT' ? (
            <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(event) => setIsInternal(event.target.checked)}
                className="accent-foreground size-4"
              />
              Internal note
            </label>
          ) : (
            <span />
          )}

          <Button type="submit" size="sm" disabled={!canSubmit}>
            {mutation.isPending ? 'Sending…' : 'Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CommentRow({ comment, isPending }: { comment: Comment; isPending: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-3',
        comment.isInternal && 'border-amber-500/30 bg-amber-500/5',
        isPending && 'opacity-60',
      )}
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">
          {comment.author.name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('')}
        </AvatarFallback>
      </Avatar>

      <div className="grid flex-1 gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{comment.author.name}</span>
          <Badge variant="outline" className="text-[10px] font-normal">
            {comment.author.role}
          </Badge>
          {comment.isInternal ? (
            <span className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
              <Lock className="size-3" />
              Internal
            </span>
          ) : null}
          <span className="text-muted-foreground ml-auto text-xs">
            {isPending ? 'Sending…' : formatDateTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
      </div>
    </div>
  );
}
