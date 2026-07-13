import uuid
from fastapi.testclient import TestClient

def test_create_user(client: TestClient):
    data = {"email": "test@example.com", "password": "securepassword", "full_name": "Test User"}
    response = client.post("/api/v1/users/", json=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["message"] == "User created successfully"
    assert res_data["data"]["email"] == "test@example.com"
    assert "id" in res_data["data"]

def test_create_user_duplicate_email(client: TestClient):
    data = {"email": "test@example.com", "password": "securepassword", "full_name": "Test User"}
    client.post("/api/v1/users/", json=data)
    response = client.post("/api/v1/users/", json=data)
    assert response.status_code == 400
    assert response.json()["message"] == "Email already registered"

def test_list_users(client: TestClient):
    data = {"email": "test1@example.com", "password": "p1", "full_name": "User 1"}
    client.post("/api/v1/users/", json=data)
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    res_data = response.json()
    assert "pagination" in res_data
    assert res_data["pagination"]["totalItems"] >= 1
    assert isinstance(res_data["data"], list)
    assert len(res_data["data"]) >= 1

def test_get_user(client: TestClient):
    data = {"email": "test2@example.com", "password": "p2", "full_name": "User 2"}
    create_resp = client.post("/api/v1/users/", json=data)
    user_id = create_resp.json()["data"]["id"]

    response = client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["data"]["email"] == "test2@example.com"

def test_get_user_not_found(client: TestClient):
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/users/{fake_id}")
    assert response.status_code == 404

def test_update_user(client: TestClient):
    data = {"email": "test3@example.com", "password": "p3", "full_name": "User 3"}
    create_resp = client.post("/api/v1/users/", json=data)
    user_id = create_resp.json()["data"]["id"]

    update_data = {"full_name": "Updated User 3"}
    response = client.put(f"/api/v1/users/{user_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["data"]["full_name"] == "Updated User 3"

def test_delete_user(client: TestClient):
    data = {"email": "test4@example.com", "password": "p4", "full_name": "User 4"}
    create_resp = client.post("/api/v1/users/", json=data)
    user_id = create_resp.json()["data"]["id"]

    del_resp = client.delete(f"/api/v1/users/{user_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["message"] == "User deleted successfully"

    get_resp = client.get(f"/api/v1/users/{user_id}")
    assert get_resp.status_code == 404
