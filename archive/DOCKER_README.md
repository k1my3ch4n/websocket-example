# 가위바위보 게임 Docker 배포 가이드

## 🐳 Docker로 배포하기

### 1. 개발 환경에서 실행

```bash
# 개발 환경에서 실행
npm run dev          # Next.js 개발 서버
npm run websocket    # WebSocket 서버
```

### 2. Docker로 빌드 및 실행

#### 개별 서비스 빌드

```bash
# Next.js 앱 빌드
docker build -f Dockerfile.nextjs -t rock-paper-scissors-web .

# WebSocket 서버 빌드
docker build -f Dockerfile.websocket -t rock-paper-scissors-websocket .
```

#### Docker Compose로 실행 (권장)

```bash
# 모든 서비스 빌드 및 실행
docker-compose up --build

# 백그라운드에서 실행
docker-compose up -d --build

# 서비스 중지
docker-compose down
```

### 3. 프로덕션 배포

#### 환경 변수 설정

```bash
# 프로덕션 환경 변수 설정
export NODE_ENV=production
export NEXT_PUBLIC_WEBSOCKET_URL=ws://your-domain.com:8080
```

#### Docker Compose 프로덕션 실행

```bash
# 프로덕션 모드로 실행
docker-compose -f docker-compose.yml up -d --build
```

## 🌐 접속 방법

- **웹 애플리케이션**: http://localhost:3000
- **WebSocket 서버**: ws://localhost:8080

## 📁 파일 구조

```
websocket/
├── Dockerfile.nextjs          # Next.js 앱용 Dockerfile
├── Dockerfile.websocket       # WebSocket 서버용 Dockerfile
├── docker-compose.yml         # Docker Compose 설정
├── .dockerignore              # Docker 빌드 시 제외할 파일들
├── env.example                # 환경 변수 예시
├── env.production             # 프로덕션 환경 변수
└── next.config.ts             # Next.js 설정 (standalone 모드)
```

## 🔧 환경 변수

### 개발 환경
- `NODE_ENV=development`
- `NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080`

### 프로덕션 환경
- `NODE_ENV=production`
- `NEXT_PUBLIC_WEBSOCKET_URL=ws://your-domain.com:8080`

## 🚀 클라우드 배포

### AWS ECS
1. Docker 이미지를 ECR에 푸시
2. ECS 서비스 생성
3. 로드 밸런서 설정

### Google Cloud Run
1. Docker 이미지를 Container Registry에 푸시
2. Cloud Run 서비스 생성
3. 환경 변수 설정

### Azure Container Instances
1. Docker 이미지를 Container Registry에 푸시
2. Container Instance 생성
3. 포트 매핑 설정

## 📊 모니터링

### 로그 확인
```bash
# 모든 서비스 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f web
docker-compose logs -f websocket
```

### 헬스 체크
- **웹 앱**: http://localhost:3000
- **WebSocket**: ws://localhost:8080 연결 테스트

## 🔒 보안 고려사항

1. **환경 변수**: 민감한 정보는 환경 변수로 관리
2. **네트워크**: 필요한 포트만 노출
3. **이미지**: 최소한의 의존성만 포함
4. **업데이트**: 정기적인 보안 업데이트

## 🛠️ 트러블슈팅

### WebSocket 연결 실패
- 방화벽 설정 확인
- 포트 8080이 열려있는지 확인
- 환경 변수 `NEXT_PUBLIC_WEBSOCKET_URL` 확인

### 빌드 실패
- Docker 데몬이 실행 중인지 확인
- 충분한 디스크 공간 확보
- `.dockerignore` 파일 확인

### 메모리 부족
- Docker 메모리 제한 설정
- 불필요한 컨테이너 정리
