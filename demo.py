# import base64
# import string
# from random import choice
# from captcha.image import ImageCaptcha
# image = ImageCaptcha()
# code = ''.join(choice(string.ascii_uppercase + string.digits) for _ in range(4))
# data = image.generate(code)
#
# print(code)
# print(data)
#
# b64 = base64.b64encode(data.getvalue()).decode()
#
# print(b64)


data = [
    {
        "department": "IT",
        "employees": ["Tom", "Lucy"]
    },
    {
        "department": "HR",
        "employees": ["Jack", "Lily"]
    }
]


print(data[0]['employees'][1])