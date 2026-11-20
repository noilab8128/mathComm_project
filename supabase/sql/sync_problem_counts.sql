-- Record of what ALREADY RUNS on the live database (read from pg_proc / pg_trigger on 2026-11-20).
-- Nothing to run: it only keeps in the repository the trigger that nobody had written down (security item C3).
-- It keeps problems.starts_count and problems.likes_count in step with user_starts and user_likes:
-- +1 when a row is added, -1 (never below 0) when a row is deleted. Running this file again changes nothing.
--
-- Other triggers seen the same day (not repeated here):
--   public.problem_reviews_keep_history  -> supabase/sql/problem_verification.sql
--   orig_problems.set_problems_updated_at (set_updated_at(): new.updated_at = now())

CREATE OR REPLACE FUNCTION public.sync_problem_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (TG_TABLE_NAME = 'user_likes') THEN
            UPDATE public.problems SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.problem_id;
        ELSIF (TG_TABLE_NAME = 'user_starts') THEN
            UPDATE public.problems SET starts_count = COALESCE(starts_count, 0) + 1 WHERE id = NEW.problem_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (TG_TABLE_NAME = 'user_likes') THEN
            UPDATE public.problems SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.problem_id;
        ELSIF (TG_TABLE_NAME = 'user_starts') THEN
            UPDATE public.problems SET starts_count = GREATEST(COALESCE(starts_count, 0) - 1, 0) WHERE id = OLD.problem_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS tr_sync_likes_count ON public.user_likes;
CREATE TRIGGER tr_sync_likes_count AFTER INSERT OR DELETE ON public.user_likes
    FOR EACH ROW EXECUTE FUNCTION public.sync_problem_counts();

DROP TRIGGER IF EXISTS tr_sync_starts_count ON public.user_starts;
CREATE TRIGGER tr_sync_starts_count AFTER INSERT OR DELETE ON public.user_starts
    FOR EACH ROW EXECUTE FUNCTION public.sync_problem_counts();
