import json
import os

import requests

headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjYwNjE3OTYsInN1YiI6IjEzNjMzMDEyNzcxIn0._S3QvwpOC6zN-2wVPthjRwu4n3VLBeYlL9ttGxpVx-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Origin': 'https://www.kbainote.com',
    'Pragma': 'no-cache',
    'Referer': 'https://www.kbainote.com/course/4',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Cookie': 'Authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjYwNjE3OTYsInN1YiI6IjEzNjMzMDEyNzcxIn0._S3QvwpOC6zN-2wVPthjRwu4n3VLBeYlL9ttGxpVx-8'
}

url = 'https://www.kbainote.com/onlineCourse/api/lessonList/v1'

req_py_base_lib = 'req_py_base_lib'
req_yolo_lib = 'req_yolo_lib'
req_opencv_lib = 'req_opencv_lib'

payload_py_base_id = 7
payload_yolo_id = 4
payload_opencv_id = 1


def load_base(url, payload_id):
    payload = json.dumps({
        "courseId": payload_id
    })

    result = requests.post(url=url, headers=headers, data=payload)

    res = json.loads(result.content.decode('utf-8'))
    print(res)

    lessons = res["data"]["lessons"]

    result = []
    for lesson in lessons:
        item = {
            "title": lesson["title"],
            "appId": lesson["appId"],
            "fileId": lesson["fileId"],
            "PSign": lesson["PSign"]
        }
        result.append(item)

    for r in result:
        print(r)

    return result


def down_base(appId, fileId, PSign, lib_path):
    url = (
        f"https://playvideo.qcloud.com/getplayinfo/v4/"
        f"{appId}/{fileId}"
        f"?psign={PSign}&keyId=1"
    )

    result = requests.get(url=url, headers=headers)

    res = json.loads(result.content.decode('utf-8'))
    print(res)

    res_name = res['media']['basicInfo']['name']
    res_video_url = res['media']['originalInfo']['url']

    resp = requests.get(res_video_url, headers=headers, stream=True)

    os.makedirs(lib_path, exist_ok=True)
    file_path = os.path.join(lib_path, res_name)

    with open(file_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    print("下载完成")


if __name__ == '__main__':

    COURSES = [
        {
            "course_id": payload_py_base_id,
            "save_dir": req_py_base_lib
        },
        {
            "course_id": payload_yolo_id,
            "save_dir": req_yolo_lib
        },
        {
            "course_id": payload_opencv_id,
            "save_dir": req_opencv_lib
        }
    ]

    for course in COURSES:
        course_id = course["course_id"]
        save_dir = course["save_dir"]
        lessons = load_base(url, course_id)

        for lesson in lessons:
            down_base(
                lesson["appId"],
                lesson["fileId"],
                lesson["PSign"],
                lib_path=save_dir
            )
