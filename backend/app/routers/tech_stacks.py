from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import DeveloperTechStack, TechStack, User
from app.schemas import (
    DeveloperTechStackResponse,
    TechStackCreate,
    TechStackResponse,
    TechStackUpdate,
)

router = APIRouter(prefix="/api/tech-stacks", tags=["tech-stacks"])


@router.get("", response_model=list[TechStackResponse])
async def get_tech_stacks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    result = await db.execute(select(TechStack).order_by(TechStack.name.asc()))
    return result.scalars().all()


@router.post("", response_model=TechStackResponse, status_code=status.HTTP_201_CREATED)
async def create_tech_stack(
    body: TechStackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    existing = await db.scalar(select(TechStack).where(TechStack.name == body.name))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tech stack already exists",
        )

    tech_stack = TechStack(**body.model_dump())
    db.add(tech_stack)
    await db.commit()
    await db.refresh(tech_stack)
    return tech_stack


@router.patch("/{tech_stack_id}", response_model=TechStackResponse)
async def update_tech_stack(
    tech_stack_id: int,
    body: TechStackUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    tech_stack = await db.get(TechStack, tech_stack_id)
    if tech_stack is None:
        raise HTTPException(status_code=404, detail="Tech stack not found")

    if body.name and body.name != tech_stack.name:
        existing = await db.scalar(select(TechStack).where(TechStack.name == body.name))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tech stack already exists",
            )

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(tech_stack, field, value)

    await db.commit()
    await db.refresh(tech_stack)
    return tech_stack


@router.delete("/{tech_stack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tech_stack(
    tech_stack_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    del current_user
    tech_stack = await db.get(TechStack, tech_stack_id)
    if tech_stack is None:
        raise HTTPException(status_code=404, detail="Tech stack not found")

    await db.delete(tech_stack)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=list[DeveloperTechStackResponse])
async def get_my_tech_stacks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DeveloperTechStack)
        .options(selectinload(DeveloperTechStack.tech_stack))
        .where(DeveloperTechStack.developer_id == current_user.id)
        .order_by(DeveloperTechStack.created_at.desc())
    )
    return result.scalars().all()


@router.post("/me/{tech_stack_id}", response_model=DeveloperTechStackResponse, status_code=status.HTTP_201_CREATED)
async def add_my_tech_stack(
    tech_stack_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tech_stack = await db.get(TechStack, tech_stack_id)
    if tech_stack is None:
        raise HTTPException(status_code=404, detail="Tech stack not found")

    existing_link = await db.scalar(
        select(DeveloperTechStack).where(
            DeveloperTechStack.developer_id == current_user.id,
            DeveloperTechStack.tech_stack_id == tech_stack_id,
        )
    )
    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tech stack already assigned to this developer",
        )

    link = DeveloperTechStack(
        developer_id=current_user.id,
        tech_stack_id=tech_stack_id,
    )
    db.add(link)
    await db.commit()
    result = await db.execute(
        select(DeveloperTechStack)
        .options(selectinload(DeveloperTechStack.tech_stack))
        .where(DeveloperTechStack.id == link.id)
    )
    return result.scalar_one()


@router.delete("/me/{tech_stack_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_my_tech_stack(
    tech_stack_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = await db.scalar(
        select(DeveloperTechStack).where(
            DeveloperTechStack.developer_id == current_user.id,
            DeveloperTechStack.tech_stack_id == tech_stack_id,
        )
    )
    if link is None:
        raise HTTPException(status_code=404, detail="Assigned tech stack not found")

    await db.delete(link)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
