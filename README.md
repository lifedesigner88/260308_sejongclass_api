# Sejong Class API Study Project

FastAPI, PostgreSQL, React(Vite)로 만든 최소 예제입니다. 파일 수를 줄이되, 학습할 때 중요한 경계는 남겨 두는 방향으로 정리했습니다.

기본 로그인 템플릿에 더해 개발자-기술스택 M:N 관계, JWT 인증, 백엔드 테스트 코드까지 포함했습니다.

## 구조

```text
backend/
  app/
    core/config.py      # 환경변수 기반 설정
    database.py         # SQLAlchemy 엔진 / 세션 / Base
    models.py           # users / tech_stacks / developer_tech_stacks
    security.py         # 비밀번호 해시 / JWT 생성 검증
    dependencies/auth.py# 현재 사용자 조회
    routers/auth.py     # 회원가입 / 로그인 / 내 정보
    routers/tech_stacks.py # 기술스택 마스터 + 내 기술 연결
    schemas.py          # 요청/응답 스키마
    main.py             # FastAPI 앱 시작점
  tests/
    test_auth_tech_stacks.py  # 인증 + M:N 관계 테스트
frontend/
  src/
    lib/api.ts          # fetch 래퍼
    lib/session.ts      # localStorage 세션 저장
    routes/login.tsx    # 로그인 / 회원가입 화면
    routes/home.tsx     # 기술스택 CRUD + 할당 화면
docker-compose.yml      # 전체 개발 환경
```

## 데이터 흐름

1. 사용자가 프론트에서 회원가입 또는 로그인을 합니다.
2. 백엔드는 JWT access token을 발급합니다.
3. 프론트는 토큰을 localStorage에 저장하고 이후 요청에 Bearer 토큰을 붙입니다.
4. 로그인한 개발자는 기술스택 마스터를 CRUD 하고, 자신의 기술 목록에 연결/해제할 수 있습니다.

## 테이블 생성 위치

- 앱 시작 시 `backend/app/main.py` 에서 `Base.metadata.create_all()` 이 실행됩니다.
- 어떤 테이블을 만들지는 `backend/app/models.py` 에 정의합니다.
- 현재는 `users`, `tech_stacks`, `developer_tech_stacks` 세 테이블이 생성됩니다.

현재는 학습용으로 `create_all()` 을 사용합니다. 실무에서는 Alembic 같은 마이그레이션 도구로 바꾸는 것이 맞습니다.

## 실행 방법

### Docker Compose

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Postgres: `localhost:5433`

### 로컬 분리 실행

백엔드 환경변수 예시는 `backend/.env.example` 를 참고합니다.

프론트 환경변수 예시는 `frontend/.env.example` 를 참고합니다.

`.env.example` 파일은 자동으로 읽히지 않습니다. 로컬 실행 시에는 값을 직접 export 하거나, 사용하는 도구에 맞게 `.env` 파일로 복사해서 써야 합니다.

로컬에서 프론트를 실행할 때는 `VITE_API_PROXY_TARGET=http://localhost:8000` 으로 두면 됩니다.

## 공부 포인트

- `security.py`: 비밀번호 해시와 JWT를 왜 분리하는지
- `dependencies/auth.py`: 라우터에서 현재 로그인 사용자를 어떻게 주입받는지
- `models.py`: 1:N 대신 M:N 관계를 중간 테이블로 어떻게 표현하는지
- `schemas.py`: 요청 데이터 검증과 응답 직렬화가 왜 분리되는지
- `routers/auth.py`: 인증 API 흐름
- `routers/tech_stacks.py`: 마스터 데이터 CRUD와 사용자별 연결 처리
- `database.py`: 세션 생명주기
- `frontend/src/lib/api.ts`: UI와 네트워크 로직 분리
- `frontend/src/lib/session.ts`: 브라우저 세션 저장 위치

## 테스트 실행

백엔드 테스트는 SQLite 테스트 DB를 사용합니다.

```bash
cd backend
pip install -e '.[dev]'
pytest
```

## 지금 구조에서 일부러 단순화한 점

- Alembic 마이그레이션 없음
- Refresh token / 인증 만료 갱신 없음
- 프론트엔드 테스트 없음
- 스타일링 최소화

학습 순서는 `models.py -> security.py -> dependencies/auth.py -> routers/auth.py -> routers/tech_stacks.py -> main.py -> frontend/src/lib/api.ts -> frontend/src/lib/session.ts -> login.tsx -> home.tsx -> tests` 순서가 가장 읽기 쉽습니다.
