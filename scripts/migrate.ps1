$DATABASE = if ($args.Count -gt 0) { $args[0] } else { "" }
docker compose run --rm --user "1000:1000" -e DATABASE="$DATABASE" migrate