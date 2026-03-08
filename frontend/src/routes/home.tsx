import { useEffect, useMemo, useState } from 'react'
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from 'react-router'
import { Alert } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import {
  type DeveloperTechStack,
  type TechStack,
  assignMyTechStack,
  createTechStack,
  deleteTechStack,
  removeMyTechStack,
  updateTechStack,
} from '../lib/api'
import { queryClient } from '../lib/query'
import { getMeQueryOptions, getMyTechStacksQueryOptions, getTechStacksQueryOptions, queryKeys, useMe, useMyTechStacks, useTechStacks } from '../lib/query-hooks'
import { clearSession, loadSession } from '../lib/session'

type HomeLoaderData = {
  session: NonNullable<ReturnType<typeof loadSession>>
}

type HomeActionData = {
  error?: string
  intent?: string
  ok?: boolean
}

function isAuthFailure(error: unknown) {
  return error instanceof Error && error.message === 'Invalid or expired token'
}

export async function loader(): Promise<HomeLoaderData> {
  const session = loadSession()

  if (!session) {
    throw redirect('/login')
  }

  try {
    await Promise.all([
      queryClient.ensureQueryData(getMeQueryOptions(session.accessToken)),
      queryClient.ensureQueryData(getTechStacksQueryOptions(session.accessToken)),
      queryClient.ensureQueryData(getMyTechStacksQueryOptions(session.accessToken)),
    ])
  } catch (error) {
    if (isAuthFailure(error)) {
      clearSession()
      queryClient.clear()
      throw redirect('/login')
    }

    throw error
  }

  return { session }
}

export async function action({ request }: { request: Request }): Promise<HomeActionData> {
  const session = loadSession()

  if (!session) {
    throw redirect('/login')
  }

  const formData = await request.formData()
  const intent = String(formData.get('intent') ?? '')

  try {
    switch (intent) {
      case 'logout':
        clearSession()
        queryClient.clear()
        throw redirect('/login')
      case 'create':
        await createTechStack(session.accessToken, {
          name: String(formData.get('name') ?? ''),
          category: String(formData.get('category') ?? '') || undefined,
        })
        break
      case 'update':
        await updateTechStack(session.accessToken, Number(formData.get('id')), {
          name: String(formData.get('name') ?? ''),
          category: String(formData.get('category') ?? '') || undefined,
        })
        break
      case 'delete':
        await deleteTechStack(session.accessToken, Number(formData.get('id')))
        break
      case 'assign':
        await assignMyTechStack(session.accessToken, Number(formData.get('techStackId')))
        break
      case 'unassign':
        await removeMyTechStack(session.accessToken, Number(formData.get('techStackId')))
        break
      default:
        return { error: '알 수 없는 요청입니다.', intent }
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.techStacks }),
      queryClient.invalidateQueries({ queryKey: queryKeys.myTechStacks }),
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
    ])

    return { ok: true, intent }
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }

    if (isAuthFailure(error)) {
      clearSession()
      queryClient.clear()
      throw redirect('/login')
    }

    return {
      error: error instanceof Error ? error.message : '요청 처리에 실패했습니다.',
      intent,
    }
  }
}

export default function Home() {
  const { session } = useLoaderData() as HomeLoaderData
  const actionData = useActionData() as HomeActionData | undefined
  const navigation = useNavigation()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: user, error: meError } = useMe(true)
  const { data: techStacks = [], error: techStackError, isLoading: isTechStacksLoading } = useTechStacks(true)
  const { data: myTechStacks = [], error: myTechStacksError, isLoading: isMyTechStacksLoading } = useMyTechStacks(true)
  const activeIntent = navigation.formData?.get('intent')
  const isSaving = navigation.state === 'submitting' && (activeIntent === 'create' || activeIntent === 'update')

  useEffect(() => {
    const nextError =
      actionData?.error
        ? actionData.error
        : meError instanceof Error
        ? meError.message
        : techStackError instanceof Error
          ? techStackError.message
          : myTechStacksError instanceof Error
            ? myTechStacksError.message
            : null
    setError(nextError)
  }, [actionData?.error, meError, myTechStacksError, techStackError])

  useEffect(() => {
    if (actionData?.ok && (actionData.intent === 'create' || actionData.intent === 'update')) {
      setName('')
      setCategory('')
      setEditingId(null)
    }
  }, [actionData])

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
            <h3 style={{ margin: '4px 0 0' }}>{user?.full_name || user?.email || session.user.email}</h3>
            <p className="muted" style={{ marginBottom: 16 }}>{user?.email || session.user.email}</p>
            <Form method="post">
              <input type="hidden" name="intent" value="logout" />
              <Button variant="outline">로그아웃</Button>
            </Form>
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
            <Form method="post" className="form-grid">
              <input type="hidden" name="intent" value={editingId ? 'update' : 'create'} />
              {editingId && <input type="hidden" name="id" value={editingId} />}
              <Input
                name="name"
                placeholder="기술 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                name="category"
                placeholder="카테고리 (frontend, backend, infra)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? '저장 중...' : editingId ? '수정 저장' : '기술 추가'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={cancelEdit}>
                    취소
                  </Button>
                )}
              </div>
            </Form>
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
                      <Form method="post">
                        <input type="hidden" name="intent" value="unassign" />
                        <input type="hidden" name="techStackId" value={item.tech_stack_id} />
                        <Button variant="outline">내 목록에서 제거</Button>
                      </Form>
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
                    <Form method="post">
                      <input type="hidden" name="intent" value="assign" />
                      <input type="hidden" name="techStackId" value={techStack.id} />
                      <Button
                        variant={assignedTechStackIds.has(techStack.id) ? 'secondary' : 'default'}
                        disabled={assignedTechStackIds.has(techStack.id)}
                      >
                        {assignedTechStackIds.has(techStack.id) ? '보유 중' : '내 기술로 추가'}
                      </Button>
                    </Form>
                    <Button variant="outline" onClick={() => startEdit(techStack)}>수정</Button>
                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={techStack.id} />
                      <Button variant="destructive">삭제</Button>
                    </Form>
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
