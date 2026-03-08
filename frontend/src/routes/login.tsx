import { useState } from 'react'
import { Form, Link, redirect, useActionData, useNavigation } from 'react-router'
import { Alert } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { loginUser, registerUser } from '../lib/api'
import { clearSession, loadSession, saveSession } from '../lib/session'

type Mode = 'login' | 'register'
type LoginActionData = {
  error?: string
}

export async function loader() {
  if (loadSession()) {
    throw redirect('/')
  }

  return null
}

export async function action({ request }: { request: Request }): Promise<LoginActionData> {
  const formData = await request.formData()
  const mode = formData.get('mode')
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '')

  try {
    const response = await (mode === 'register'
      ? registerUser({
          email,
          password,
          full_name: fullName || undefined,
        })
      : loginUser({ email, password }))

    saveSession({ accessToken: response.access_token, user: response.user })
    throw redirect('/')
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }

    clearSession()

    return {
      error: error instanceof Error ? error.message : '인증 처리에 실패했습니다.',
    }
  }
}

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const actionData = useActionData() as LoginActionData | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

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

          {actionData?.error && <Alert style={{ marginBottom: 16 }}>{actionData.error}</Alert>}

          <Form method="post" className="form-grid">
            <input type="hidden" name="mode" value={mode} />
            {mode === 'register' && (
              <Input
                name="fullName"
                placeholder="이름 (선택)"
              />
            )}
            <Input
              name="email"
              type="email"
              placeholder="이메일"
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="비밀번호 (8자 이상)"
              required
              minLength={8}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </Button>
          </Form>

          <p className="muted" style={{ marginTop: 16 }}>
            <Link to="/about">구조 설명 보기</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
