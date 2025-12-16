import os

import requests

def download_http_file(url: str, is_stream=True):
    res = requests.get(url, stream=is_stream)
    res.raise_for_status()

    filename = url.split('/')[-1]
    # 创建lib目录(如果不存在)
    lib_dir = os.path.join(os.path.dirname(__file__),'lib')
    os.makedirs(lib_dir,exist_ok=True)
    file_path = os.path.join(lib_dir,filename)

    with open(file_path,'wb') as file:
        if  is_stream:
            for chunk in res.iter_content(chunk_size=8192):
                file.write(chunk)
        else:
            file.write(res.content)

    return True


if __name__ == '__main__':
    url = 'http://127.0.0.1:9000/media/28dd2c7955ce926456240b2ff0100bde/f73b76ce8949fe29bf2a537cfa420e8f/2025R11L23758691.pdf'
    results = download_http_file(url)
    print(results)
    print(type(results))
