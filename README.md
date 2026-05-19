# Nuxt + Nest Book Learning Project

This project demonstrates a production-style architecture with:

- **Nuxt 3 frontend** for book upload, listing, viewing, and searching.
- **NestJS backend** for API, XML parsing, queue consumer, indexing, and caching.
- **RabbitMQ** for asynchronous XML parsing jobs.
- **PostgreSQL** as the main database for raw XML + parsed HTML content.
- **Elasticsearch** for full-text search over titles and content.
- **Redis** for caching book details.
- **Docker + Docker Compose** for local development.
- **Kubernetes manifests** for `dev` and `prod`.
- **GitHub Actions** for CI and auto-deploy pipelines.
- **AWS Terraform stubs** for ECR + S3 + CloudFront foundations.

## Book Flow

1. Frontend sends XML with `POST /books/upload`.
2. Backend stores record in PostgreSQL with status `QUEUED`.
3. Backend publishes `{ bookId }` message to RabbitMQ.
4. Worker consumes message, parses XML -> HTML, updates DB status/content.
5. Parsed content is indexed in Elasticsearch for search.
6. Read APIs use Redis cache for quick responses.

## Quick Start (Local)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start infra + apps:

   ```bash
   docker compose up --build
   ```

3. Open:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:4000/books`
   - RabbitMQ UI: `http://localhost:15672` (`guest`/`guest`)
   - Elasticsearch: `http://localhost:9200`
   - Kibana: `http://localhost:5601`

## API Endpoints

- `POST /books/upload`
  - body:
    ```json
    {
      "title": "My XML Book",
      "xmlContent": "<book>...</book>"
    }
    ```
- `GET /books`
- `GET /books/:id`
- `GET /books/search?q=keyword`

## Environment Setup

- Backend env template: `apps/backend/.env.example`
- Frontend env template: `apps/frontend/.env.example`

Create `.env` files from these templates when running outside Docker Compose.

## Dev and Prod Environments

- `k8s/dev/*` for dev namespace and lower replicas.
- `k8s/prod/*` for prod namespace and higher replicas.
- GitHub Actions:
  - `ci.yml`: lint + build on PR/push.
  - `deploy.yml`: builds/pushes images and deploys to EKS dev/prod.

## AWS + CloudFront Notes

- Terraform files in `infra/terraform` create:
  - ECR repos for frontend/backend images.
  - S3 bucket for frontend assets.
  - CloudFront distribution in front of S3.
- In production, set your domain + ACM certificates + origin access controls before go-live.

## Next Enhancements

- Add auth/roles and audit logs.
- Move Rabbit/Redis/Elasticsearch to managed AWS services.
- Add migrations, integration tests, and observability (OpenTelemetry + CloudWatch).
