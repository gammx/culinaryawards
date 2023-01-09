import { useRef } from 'react'

interface UseUploadImageOptions {
  onUpload: (image: string | ArrayBuffer) => void
}

export const isValidMimeType = (mime: string) => {
  return ['image/png', 'image/jpeg', 'image/gif'].includes(mime)
}

const useUploadImage = ({
  onUpload
}: UseUploadImageOptions) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const uploadImage = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files) return

    const file = fileInputRef.current.files[0]
    if (file) {
      const reader = new FileReader()
      const url = reader.readAsDataURL(file)
      reader.onloadend = async (e) => {
        if (e.target?.readyState === FileReader.DONE) {
          if (isValidMimeType(file.type) && reader.result) {
            onUpload(reader.result)
          }
        }
      }
    }
    fileInputRef.current.value = ''
  }

  return {
    fileInputRef,
    uploadImage
  }
}

export default useUploadImage