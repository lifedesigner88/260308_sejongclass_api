# Sejong Class API Study Project

FastAPI, PostgreSQL, React Router 기반 프론트를 한 번에 띄워 보면서 JWT 인증, 기술스택 CRUD, 개발자-기술스택 M:N 관계를 같이 학습할 수 있게 만든 풀스택 예제입니다.

이 레포는 실행 진입 장벽을 낮추는 쪽으로 맞춰져 있습니다. 기본 백엔드 환경변수는 [backend/.env.example](/home/sejong/260308_sejongclass_api/backend/.env.example)에 들어 있고, `docker-compose.yml`에서 그대로 읽도록 구성되어 있어서 레포를 받은 뒤 바로 `docker compose up --build`로 실행할 수 있습니다.

## 프로젝트 소개

- 백엔드: FastAPI + SQLAlchemy + PostgreSQL + JWT 인증
- 프론트엔드: React Router v7 + TanStack Query
- 핵심 도메인: 회원가입, 로그인, 내 정보 조회, 기술스택 마스터 관리, 내 기술 연결/해제
- 학습 포인트: 인증 흐름, 환경변수 기반 설정, API/프론트 경계, M:N 관계 모델링, Query 캐시 동기화

핵심 테이블은 `users`, `tech_stacks`, `developer_tech_stacks` 세 개입니다. 백엔드 시작 시 [backend/app/main.py](/home/sejong/260308_sejongclass_api/backend/app/main.py)에서 `Base.metadata.create_all()`을 호출해 필요한 테이블을 자동 생성합니다.

## Linux 최소 설치

Ubuntu/Debian 계열 서버에서 처음 세팅할 때는 아래 정도면 충분합니다.

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

그 다음 레포를 받은 뒤 바로 실행하면 됩니다.

## 빠른 실행

```bash
docker compose up --build
```

실행 후 접속 주소:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Backend health check: `http://localhost:8000/api/health`
- PostgreSQL: `localhost:5433`

현재 Compose 구성은 다음 전제를 이미 포함합니다.

- 백엔드는 [backend/.env.example](/home/sejong/260308_sejongclass_api/backend/.env.example)을 `env_file`로 읽습니다.
- 프론트는 `VITE_API_PROXY_TARGET=http://backend:8000` 값을 Compose에서 주입받습니다.
- DB가 준비된 뒤 백엔드가 뜨도록 `depends_on`과 health check가 설정되어 있습니다.

즉, Docker Compose 기준으로는 별도 `.env` 복사 없이 바로 실행하면 됩니다.

## 구조

```text
backend/
  app/
    core/config.py          # 환경변수 기반 설정
    database.py             # SQLAlchemy 엔진 / 세션 / Base
    models.py               # users / tech_stacks / developer_tech_stacks
    security.py             # 비밀번호 해시 / JWT 생성 검증
    dependencies/auth.py    # 현재 사용자 조회
    routers/auth.py         # 회원가입 / 로그인 / 내 정보
    routers/tech_stacks.py  # 기술스택 마스터 + 내 기술 연결
    schemas.py              # 요청/응답 스키마
    main.py                 # FastAPI 앱 시작점
  tests/
    test_auth_tech_stacks.py
frontend/
  src/
    lib/api.ts              # fetch 래퍼
    lib/session.ts          # localStorage 세션 저장
    routes/login.tsx        # 로그인 / 회원가입 화면
    routes/home.tsx         # 기술스택 CRUD + 할당 화면
    routes/about.tsx        # 프로젝트 소개 화면
docker-compose.yml          # 전체 개발 환경
```

## 동작 흐름

1. 사용자가 프론트에서 회원가입 또는 로그인을 합니다.
2. 백엔드는 JWT access token을 발급합니다.
3. 프론트는 토큰을 localStorage에 저장하고 이후 요청에 Bearer 토큰을 붙입니다.
4. 로그인한 사용자는 기술스택 마스터를 조회/생성/수정/삭제하고, 자신의 기술 목록에 연결하거나 해제할 수 있습니다.

## 로컬 분리 실행

Docker Compose가 아니라 서비스별로 따로 실행할 때만 환경변수를 직접 다루면 됩니다.

- 백엔드 예시: [backend/.env.example](/home/sejong/260308_sejongclass_api/backend/.env.example)
- 프론트 예시: [frontend/.env.example](/home/sejong/260308_sejongclass_api/frontend/.env.example)

로컬에서 프론트를 따로 띄울 때는 `VITE_API_PROXY_TARGET=http://localhost:8000`으로 두면 됩니다.

## 테스트

백엔드 테스트는 SQLite 테스트 DB를 사용합니다.

```bash
cd backend
pip install -e '.[dev]'
pytest
```

## 공부 포인트

- [backend/app/security.py](/home/sejong/260308_sejongclass_api/backend/app/security.py): 비밀번호 해시와 JWT 처리 분리
- [backend/app/dependencies/auth.py](/home/sejong/260308_sejongclass_api/backend/app/dependencies/auth.py): 현재 로그인 사용자 주입
- [backend/app/models.py](/home/sejong/260308_sejongclass_api/backend/app/models.py): M:N 관계 모델링
- [backend/app/schemas.py](/home/sejong/260308_sejongclass_api/backend/app/schemas.py): 요청 검증과 응답 직렬화 분리
- [backend/app/routers/auth.py](/home/sejong/260308_sejongclass_api/backend/app/routers/auth.py): 인증 API 흐름
- [backend/app/routers/tech_stacks.py](/home/sejong/260308_sejongclass_api/backend/app/routers/tech_stacks.py): 마스터 데이터 CRUD와 사용자별 연결 처리
- [frontend/src/lib/api.ts](/home/sejong/260308_sejongclass_api/frontend/src/lib/api.ts): UI와 네트워크 로직 분리
- [frontend/src/lib/session.ts](/home/sejong/260308_sejongclass_api/frontend/src/lib/session.ts): 브라우저 세션 저장

## 단순화한 점

- Alembic 마이그레이션 없음
- Refresh token / 재발급 흐름 없음
- 프론트엔드 테스트 없음
- 학습용이라 앱 시작 시 테이블 자동 생성
