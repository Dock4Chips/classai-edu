

class ServiceException(Exception):
    def __init__(self, code: int = 7869, msg: str = "ServiceException"):
        self.code = code
        self.msg = msg
        super().__init__(msg)
