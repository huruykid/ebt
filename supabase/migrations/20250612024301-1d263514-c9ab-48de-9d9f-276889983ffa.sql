
-- Clear dependent tables first to avoid foreign key constraint issues
DELETE FROM store_clicks;
DELETE FROM favorites;

-- Clear the main snap_stores table
DELETE FROM snap_stores;
