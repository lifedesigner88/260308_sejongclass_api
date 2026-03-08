import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Alert } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuthMutations } from '../lib/query-hooks'
import { loadSession } from '../lib/session'

type Mode = 'login' | 'register'

export default function Login() {
  const navigate = useNavigate()
  const existingSession = loadSession()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, register } = useAuthMutations()
  const isSubmitting = login.isPending || register.isPending

  useEffect(() => {
    if (existingSession) {
      navigate('/')
    }
  }, [existingSession, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await (
        mode === 'login'
          ? login.mutateAsync({ email, password })
          : register.mutateAsync({
              email,
              password,
              full_name: fullName || undefined,
            })
      )
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 처리에 실패했습니다.')
    }
  }

  return (
    <div className="auth-layout">
      <Card>
        <CardHeader>
          <CardTitle>Developer Login Template</CardTitle>
          <CardDescription>
            JWT 인증, 세션 저장, Query 기반 캐시 흐름을 같이 보기 좋은 로그인 화면입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Button type="button" variant={mode === 'login' ? 'default' : 'secondary'} onClick={() => setMode('login')}>
              로그인
            </Button>
            <Button type="button" variant={mode === 'register' ? 'default' : 'secondary'} onClick={() => setMode('register')}>
              회원가입
            </Button>
          </div>

          {error && <Alert style={{ marginBottom: 16 }}>{error}</Alert>}

          <form onSubmit={handleSubmit} className="form-grid">
            {mode === 'register' && (
              <Input
                placeholder="이름 (선택)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호 (8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </Button>
          </form>

          <p className="muted" style={{ marginTop: 16 }}>
            <Link to="/about">구조 설명 보기</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
