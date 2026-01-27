#!/usr/bin/env python
"""
CLI tool for managing Ficcionarios users.

Usage:
    python -m server.cli create-user <username> <password>
    python -m server.cli list-users
    python -m server.cli delete-user <username>
"""
import sys
import argparse
from .app import app
from .models import db, User


def create_user(username: str, password: str) -> None:
    """Create a new user with hashed password."""
    with app.app_context():
        # Check if user exists
        existing = User.query.filter_by(username=username).first()
        if existing:
            print(f"Error: User '{username}' already exists.")
            sys.exit(1)

        # Validate input
        if len(username) < 3:
            print("Error: Username must be at least 3 characters.")
            sys.exit(1)

        if len(password) < 6:
            print("Error: Password must be at least 6 characters.")
            sys.exit(1)

        # Create user
        user = User(username=username)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        print(f"User '{username}' created successfully.")


def list_users() -> None:
    """List all users."""
    with app.app_context():
        users = User.query.order_by(User.created_at).all()

        if not users:
            print("No users found.")
            return

        print(f"\n{'ID':<5} {'Username':<20} {'Created At'}")
        print("-" * 50)
        for user in users:
            created = user.created_at.strftime("%Y-%m-%d %H:%M") if user.created_at else "N/A"
            print(f"{user.id:<5} {user.username:<20} {created}")
        print()


def delete_user(username: str) -> None:
    """Delete a user by username."""
    with app.app_context():
        user = User.query.filter_by(username=username).first()

        if not user:
            print(f"Error: User '{username}' not found.")
            sys.exit(1)

        # Check for ficcionarios created by this user
        ficcionarios_count = user.ficcionarios_created.count()
        if ficcionarios_count > 0:
            print(f"Warning: User '{username}' has created {ficcionarios_count} ficcionario(s).")
            confirm = input("Are you sure you want to delete this user? (yes/no): ")
            if confirm.lower() != "yes":
                print("Cancelled.")
                return

        db.session.delete(user)
        db.session.commit()

        print(f"User '{username}' deleted successfully.")


def main():
    parser = argparse.ArgumentParser(
        description="Ficcionarios user management CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python -m server.cli create-user admin mypassword123
    python -m server.cli list-users
    python -m server.cli delete-user olduser
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # create-user command
    create_parser = subparsers.add_parser("create-user", help="Create a new user")
    create_parser.add_argument("username", help="Username (min 3 characters)")
    create_parser.add_argument("password", help="Password (min 6 characters)")

    # list-users command
    subparsers.add_parser("list-users", help="List all users")

    # delete-user command
    delete_parser = subparsers.add_parser("delete-user", help="Delete a user")
    delete_parser.add_argument("username", help="Username to delete")

    args = parser.parse_args()

    if args.command == "create-user":
        create_user(args.username, args.password)
    elif args.command == "list-users":
        list_users()
    elif args.command == "delete-user":
        delete_user(args.username)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
