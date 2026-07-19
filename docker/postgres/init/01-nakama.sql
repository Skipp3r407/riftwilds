-- Ensure the nakama database exists (POSTGRES_DB already creates it on first boot).
-- Kept as an explicit init hook for Windows Docker Desktop volume recreations.
SELECT 'nakama postgres ready' AS status;
