from enums.login_type import LoginType
from services.strategies.identity.password_login import password_login
from services.strategies.identity.github_login import github_login
from services.strategies.identity.google_login import google_login


LOGIN_STRATEGY_MAP = {
    LoginType.password: password_login,
    LoginType.github: github_login,
    LoginType.google: google_login,
}
