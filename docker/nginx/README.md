# Nginx Configuration — Faith Laundry Shop

## Default (HTTP)

The default `nginx.conf` serves the application over HTTP on port 80. Suitable for local network deployment.

## Enable HTTPS (Self-Signed)

1. Generate self-signed certificate:
   ```bash
   sh docker/nginx/generate-ssl.sh
   ```

2. Use SSL config:
   ```bash
   cp docker/nginx/nginx-ssl.conf docker/nginx/nginx.conf
   ```

3. Restart Nginx:
   ```bash
   docker compose -f docker/docker-compose.prod.yml restart nginx
   ```

Browsers will show a security warning for self-signed certs; accept for local/network use.

## Let's Encrypt (Production Domain)

For a public domain, use Certbot to obtain trusted certificates. Mount the certbot output into `/etc/nginx/ssl/` and use `nginx-ssl.conf` with the Let's Encrypt paths.
