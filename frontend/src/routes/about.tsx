import { Link } from 'react-router'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function About() {
  return (
    <div className="app-shell">
      <Card>
        <CardHeader>
          <Badge>Study Notes</Badge>
          <CardTitle style={{ marginTop: 14 }}>About This Template</CardTitle>
          <CardDescription>
            React Router v7 + FastAPI + PostgreSQL + JWT 로그인 + M:N 관계 + TanStack Query 예제를 담았습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>핵심 테이블은 `users`, `tech_stacks`, `developer_tech_stacks` 세 개입니다.</p>
          <p>프론트는 Query 캐시를 통해 내 기술 목록과 전체 기술 목록을 자동 갱신합니다.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/"><Button>홈으로</Button></Link>
            <Link to="/login"><Button variant="outline">로그인 화면</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
