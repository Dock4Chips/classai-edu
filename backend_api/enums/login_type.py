from enum import Enum


class LoginType(str, Enum):
    password = "password"
    github = "github"
    google = "google"

