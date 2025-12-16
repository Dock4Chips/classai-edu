import os

def count_files(dir_path):
    count =  sum(len(files) for _, _, files in os.walk(dir_path))
    return count

if __name__ == '__main__':
    result =  count_files(r'/Users/dock4chips/Script-P/classai-edu/master_tools')
    print(result)


