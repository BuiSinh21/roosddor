# Deploy Route 9 Coffee — Production (Docker trên VPS Linux)

Landing page tĩnh (`CoffeeHome.html` + `image/`), đóng gói thành image Docker
(nginx serve thẳng thư mục tĩnh, không có bước build) rồi deploy lên VPS Linux
riêng bằng Docker Compose. Không có build step (không npm, không bundler).

## Cấu trúc

```
Dockerfile                  <- nginx:alpine + CoffeeHome.html (-> index.html) + image/
deploy/nginx.conf           <- server block (listen 3020): default document, cache anh 30 ngay, MIME .avif
deploy/docker-compose.yml   <- build & chay thu local (`docker compose -f deploy/docker-compose.yml up --build`)
deploy/compose.prod.yml     <- production: chi pull image tu GHCR, khong build tren VPS
deploy/.env.example         <- bien cho docker-compose.yml (local)
deploy/.env.prod.example    <- bien cho compose.prod.yml (production)
```

## Luồng deploy

Push lên `main` (hoặc bấm *Run workflow*) → [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. **build** — kiểm tra mọi tham chiếu `image/...` trong `CoffeeHome.html` đều tồn tại, rồi
   `docker build` thử để bắt lỗi Dockerfile trước khi merge. Chạy cả trên PR.
2. **push-image** — build image `route9coffee` thật, push lên GHCR với tag theo commit SHA
   và `latest`.
3. **deploy** — chạy trên self-hosted Linux runner, SSH vào VPS production, `scp` sang
   `compose.prod.yml` + `.env` sinh từ GitHub Variables, rồi `docker compose pull && up -d
   --wait` (chờ tới khi healthcheck báo "healthy").
4. Nếu bước deploy fail — dump log container để debug ngay trong log workflow.

## Chạy thử local

```bash
cp deploy/.env.example deploy/.env
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up --build
# mo http://localhost:3020
```

## Chuẩn bị VPS (làm 1 lần)

1. Cài Docker Engine + Docker Compose plugin trên VPS.
2. Cài GitHub self-hosted runner (Linux) trên VPS (hoặc một máy SSH được vào VPS), gán
   label `self-hosted` + `Linux` để job `deploy` chọn đúng runner.
3. Tạo SSH key riêng cho deploy, thêm public key vào `~/.ssh/authorized_keys` của
   `VPS_USER` trên VPS.
4. Container publish ra `10.20.0.11:3020` (LAN riêng), không bind ra IP public — cần một
   reverse proxy (Traefik/nginx) trên cùng VM hoặc cùng LAN gọi vào địa chỉ này, và đó là
   nơi cấu hình domain + TLS (443), không nằm trong `compose.prod.yml` này. Nếu VPS chỉ
   chạy mỗi site này và muốn expose thẳng, đổi lại `ports` trong `compose.prod.yml` thành
   `"${APP_PORT:-3020}:3020"` (bỏ IP `10.20.0.11:`) rồi mở port 3020 trên firewall.

## Cấu hình trên GitHub (Environment "production")

**Secrets**:

| Tên | Ý nghĩa |
| --- | --- |
| `VPS_SSH_KEY` | private key SSH để deploy vào VPS |

**Variables**:

| Tên | Ý nghĩa |
| --- | --- |
| `VPS_USER` | user SSH trên VPS |
| `VPS_HOST` | IP/hostname VPS |
| `APP_PORT` | *(tuỳ chọn)* port host map ra container, default `3020` |

`GITHUB_TOKEN` mặc định đã đủ quyền `packages: write` để push/pull GHCR, không cần khai
thêm secret riêng.

## Vận hành trên VPS

```bash
cd /home/$VPS_USER/route9coffee
docker compose -f compose.prod.yml ps
docker compose -f compose.prod.yml logs --tail=200
docker compose --env-file .env -f compose.prod.yml up -d --force-recreate   # deploy lai thu cong
```

Rollback: đổi `TAG` trong `.env` về SHA của lần deploy trước đó rồi `pull && up -d` lại —
mọi image cũ vẫn còn trên GHCR theo tag SHA.

## Ghi chú

- Trang nạp Tailwind CDN và Google Fonts từ Internet — VPS phải ra được ngoài, nếu không
  thì phần style sẽ hỏng.
- `deploy/nginx.conf` khai MIME `.avif` tường minh vì một số base image nginx chưa cập
  nhật `mime.types` cho định dạng này → thiếu là ảnh `image8.avif` trả sai content-type.
- Ảnh được cache 30 ngày (`expires 30d`). Thay ảnh mà giữ nguyên tên thì trình duyệt cũ
  vẫn dùng bản cache — nên đổi tên file (`image3.jpg` → `image3-v2.jpg`) khi thay ảnh.
