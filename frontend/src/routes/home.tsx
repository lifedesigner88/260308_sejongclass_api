import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import {
  type DeveloperTechStack,
  type TechStack,
} from '../lib/api'
import { useAuthMutations, useMe, useMyTechStacks, useSession, useTechStackMutations, useTechStacks } from '../lib/query-hooks'

export default function Home() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const { data: user, error: meError } = useMe(Boolean(session))
  const { data: techStacks = [], error: techStackError, isLoading: isTechStacksLoading } = useTechStacks(Boolean(session))
  const { data: myTechStacks = [], error: myTechStacksError, isLoading: isMyTechStacksLoading } = useMyTechStacks(Boolean(session))
  const { create, update, delete: remove, assign, unassign } = useTechStackMutations()
  const { logout } = useAuthMutations()
  const isSubmitting = create.isPending || update.isPending

  useEffect(() => {
    if (!session) {
      navigate('/login')
    }
  }, [navigate, session])

  useEffect(() => {
    const nextError =
      meError instanceof Error
        ? meError.message
        : techStackError instanceof Error
          ? techStackError.message
          : myTechStacksError instanceof Error
            ? myTechStacksError.message
            : null
    setError(nextError)
  }, [meError, myTechStacksError, techStackError])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()

    try {
      setError(null)

      if (editingId) {
        await update.mutateAsync({
          id: editingId,
          payload: {
            name,
            category: category || undefined,
          },
        })
      } else {
        await create.mutateAsync({
          name,
          category: category || undefined,
        })
      }

      setName('')
      setCategory('')
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '기술스택을 저장하지 못했습니다.')
    }
  }

  async function handleDeleteTechStack(id: number) {
    try {
      setError(null)
      await remove.mutateAsync(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '기술스택을 삭제하지 못했습니다.')
    }
  }

  async function handleAssign(techStackId: number) {
    try {
      setError(null)
      await assign.mutateAsync(techStackId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '기술스택을 추가하지 못했습니다.')
    }
  }

  async function handleUnassign(techStackId: number) {
    try {
      setError(null)
      await unassign.mutateAsync(techStackId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '기술스택을 제거하지 못했습니다.')
    }
  }

  function startEdit(techStack: TechStack) {
    setEditingId(techStack.id)
    setName(techStack.name)
    setCategory(techStack.category ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setCategory('')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const assignedTechStackIds = useMemo(
    () => new Set(myTechStacks.map((stack: DeveloperTechStack) => stack.tech_stack_id)),
    [myTechStacks],
  )

  return (
    <div className="app-shell page-grid">
      <div className="hero">
        <div className="hero-copy">
          <Badge>TanStack Query + shadcn style</Badge>
          <h1 style={{ margin: '14px 0 12px', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05 }}>
            Developer Tech Stack Template
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: 18 }}>
            JWT 인증, M:N 관계, Query 캐시, 컴포넌트 분리를 한 화면에서 같이 공부할 수 있도록 정리했습니다.
          </p>
        </div>
        <Card style={{ minWidth: 280 }}>
          <CardContent style={{ paddingTop: 22 }}>
            <p className="muted" style={{ marginTop: 0 }}>현재 개발자</p>
            <h3 style={{ margin: '4px 0 0' }}>{user?.full_name || user?.email || '세션 확인 중'}</h3>
            <p className="muted" style={{ marginBottom: 16 }}>{user?.email}</p>
            <Button variant="outline" onClick={handleLogout}>로그아웃</Button>
          </CardContent>
        </Card>
      </div>

      <div className="stats">
        <Card><CardContent><p className="muted">내 기술 수</p><h3>{myTechStacks.length}</h3></CardContent></Card>
        <Card><CardContent><p className="muted">전체 기술 수</p><h3>{techStacks.length}</h3></CardContent></Card>
        <Card><CardContent><p className="muted">캐시 상태</p><h3>{isTechStacksLoading || isMyTechStacksLoading ? '동기화 중' : '준비됨'}</h3></CardContent></Card>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="two-column">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? '기술스택 수정' : '기술스택 추가'}</CardTitle>
            <CardDescription>마스터 기술스택을 관리합니다. 수정 후 Query 캐시가 자동 갱신됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="form-grid">
              <Input
                placeholder="기술 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder="카테고리 (frontend, backend, infra)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '저장 중...' : editingId ? '수정 저장' : '기술 추가'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={cancelEdit}>
                    취소
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>내 기술스택</CardTitle>
            <CardDescription>중간 테이블 `developer_tech_stacks` 에 저장되는 내 연결 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {myTechStacks.length === 0 ? (
              <div className="empty-state">아직 연결된 기술스택이 없습니다.</div>
            ) : (
              <div className="stack-list">
                {myTechStacks.map((item) => (
                  <div key={item.id} className="stack-row">
                    <div>
                      <strong>{item.tech_stack.name}</strong>
                      {item.tech_stack.category && (
                        <p className="muted" style={{ margin: '4px 0 0' }}>{item.tech_stack.category}</p>
                      )}
                    </div>
                    <div className="stack-row-actions">
                      <Button variant="outline" onClick={() => handleUnassign(item.tech_stack_id)}>
                        내 목록에서 제거
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="section-title">
            <div>
              <CardTitle>기술스택 마스터</CardTitle>
              <CardDescription>기술 생성, 수정, 삭제와 개발자 할당을 한 곳에 모았습니다.</CardDescription>
            </div>
            <Link to="/about" className="muted">About</Link>
          </div>
        </CardHeader>
        <CardContent>
          {techStacks.length === 0 ? (
            <div className="empty-state">등록된 기술스택이 없습니다.</div>
          ) : (
            <div className="stack-list">
              {techStacks.map((techStack: TechStack) => (
                <div key={techStack.id} className="stack-row">
                  <div>
                    <strong>{techStack.name}</strong>
                    {techStack.category && (
                      <p className="muted" style={{ margin: '4px 0 0' }}>{techStack.category}</p>
                    )}
                  </div>
                  <div className="stack-row-actions">
                    <Button
                      variant={assignedTechStackIds.has(techStack.id) ? 'secondary' : 'default'}
                      disabled={assignedTechStackIds.has(techStack.id)}
                      onClick={() => handleAssign(techStack.id)}
                    >
                      {assignedTechStackIds.has(techStack.id) ? '보유 중' : '내 기술로 추가'}
                    </Button>
                    <Button variant="outline" onClick={() => startEdit(techStack)}>수정</Button>
                    <Button variant="destructive" onClick={() => handleDeleteTechStack(techStack.id)}>삭제</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
