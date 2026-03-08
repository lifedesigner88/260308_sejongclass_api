from fastapi.testclient import TestClient


def register_user(
    client: TestClient,
    email: str,
    password: str = "password123",
    full_name: str = "Tester",
):
    return client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
        },
    )


def auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


def test_register_login_and_me(client: TestClient):
    register_response = register_user(client, "alpha@example.com")
    assert register_response.status_code == 201

    register_payload = register_response.json()
    assert register_payload["user"]["email"] == "alpha@example.com"
    assert register_payload["token_type"] == "bearer"
    assert register_payload["access_token"]

    duplicate_response = register_user(client, "alpha@example.com")
    assert duplicate_response.status_code == 409

    login_response = client.post(
        "/api/auth/login",
        json={"email": "alpha@example.com", "password": "password123"},
    )
    assert login_response.status_code == 200

    me_response = client.get(
        "/api/auth/me",
        headers=auth_headers(login_response.json()["access_token"]),
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "alpha@example.com"


def test_developer_can_crud_and_assign_tech_stacks(client: TestClient):
    first_user = register_user(client, "first@example.com").json()
    second_user = register_user(client, "second@example.com").json()

    create_stack_response = client.post(
        "/api/tech-stacks",
        json={"name": "FastAPI", "category": "backend"},
        headers=auth_headers(first_user["access_token"]),
    )
    assert create_stack_response.status_code == 201
    tech_stack_id = create_stack_response.json()["id"]

    update_stack_response = client.patch(
        f"/api/tech-stacks/{tech_stack_id}",
        json={"category": "python-backend"},
        headers=auth_headers(first_user["access_token"]),
    )
    assert update_stack_response.status_code == 200
    assert update_stack_response.json()["category"] == "python-backend"

    assign_first_response = client.post(
        f"/api/tech-stacks/me/{tech_stack_id}",
        headers=auth_headers(first_user["access_token"]),
    )
    assert assign_first_response.status_code == 201
    assert assign_first_response.json()["tech_stack"]["name"] == "FastAPI"

    assign_second_response = client.post(
        f"/api/tech-stacks/me/{tech_stack_id}",
        headers=auth_headers(second_user["access_token"]),
    )
    assert assign_second_response.status_code == 201

    first_my_stacks = client.get(
        "/api/tech-stacks/me",
        headers=auth_headers(first_user["access_token"]),
    )
    assert first_my_stacks.status_code == 200
    assert len(first_my_stacks.json()) == 1

    second_my_stacks = client.get(
        "/api/tech-stacks/me",
        headers=auth_headers(second_user["access_token"]),
    )
    assert second_my_stacks.status_code == 200
    assert len(second_my_stacks.json()) == 1

    duplicate_assign = client.post(
        f"/api/tech-stacks/me/{tech_stack_id}",
        headers=auth_headers(first_user["access_token"]),
    )
    assert duplicate_assign.status_code == 409

    unassign_response = client.delete(
        f"/api/tech-stacks/me/{tech_stack_id}",
        headers=auth_headers(first_user["access_token"]),
    )
    assert unassign_response.status_code == 204

    delete_stack_response = client.delete(
        f"/api/tech-stacks/{tech_stack_id}",
        headers=auth_headers(second_user["access_token"]),
    )
    assert delete_stack_response.status_code == 204


def test_tech_stack_endpoints_require_authentication(client: TestClient):
    response = client.get("/api/tech-stacks")
    assert response.status_code == 401
