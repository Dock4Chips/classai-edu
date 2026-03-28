def stalin_sort(arr):
    if len(arr) == 0:
        return []

    kept = [arr[0]]

    maxSofar = arr[0]
    for i in range(1,len(arr)):
        if arr[i] >= maxSofar:
            kept.append(arr[i])
            maxSofar = arr[i]
    print(kept)
    return kept

if __name__ == '__main__':
    arr = [3, 17, 42, 8, 29, 64, 11, 90, 56, 21]
    stalin_sort(arr)