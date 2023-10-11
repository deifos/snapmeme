import React, { RefObject, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "./icons"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const ImageHandler = ({
  updateImageDescription,
  isMemeCaption,
  getMemeCaption,
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const [spinner, setSpinner] = useState<boolean>(false)
  const inputRef: RefObject<HTMLInputElement> = useRef<null | HTMLInputElement>(
    null
  )
  const [imageReady, setImageReady] = useState<string | null>()
  const { toast } = useToast()
  const [action, setAction] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)

  const resizeImage = async (dataURL: string) => {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        const maxWidth = 500 // Maximum width of the resized image
        const maxHeight = 500 // Maximum height of the resized image

        let width = img.width
        let height = img.height

        if (height > maxHeight) {
          width = (maxHeight / height) * width
          height = maxHeight
        }

        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        const resizedDataURL = canvas.toDataURL("image/jpeg")
        resolve(resizedDataURL)
      }
      img.src = dataURL
    })
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.[0]) return
    const file = event.target.files?.[0]
    const fileType = file.type
    if (!["image/jpeg", "image/png"].includes(fileType)) {
      toast({
        title: "Error",
        description: "Invalid file format. Please upload a JPG or PNG file.",
      })
      return
    }

    //resetomg the input so user can select the same image as before.
    event.target.value = ""

    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new window.Image()
      img.onload = () => {
        setImage(img)
        setSpinner(false)
      }
      img.src = e.target?.result as string
      console.log(img.naturalHeight)
    }
    reader?.readAsDataURL(file as Blob)
  }

  const handleOnLoadImage = (event) => {
    updateImageDescription(null)
    handleOnSubmit()
  }

  const handleOnSubmit = async () => {
    if (!image) return

    setSpinner(true)

    //resizing image to current size on screen https://codesalad.dev/blog/how-to-resize-an-image-in-10-lines-of-javascript-29
    // Initialize the canvas and it's size
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Set width and height
    if (!imageRef || !imageRef.current) {
      alert("please select a new image")
      return
    }
    canvas.width = imageRef.current.clientWidth
    canvas.height = imageRef.current.clientHeight

    // Draw image and export to a data-uri
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    const imageReady = canvas.toDataURL("png", 1)
    const imageResized = (await resizeImage(imageReady)) as string
    setImageReady(imageResized)

    const options = {
      method: "POST",
      body: JSON.stringify(imageResized),
      headers: {
        "Content-Type": "application/json",
      },
    }

    const imageDescription = await fetch("/api/get-image-description", options)
    const imageDescriptionData = await imageDescription.json()
    updateImageDescription(imageDescriptionData)
  }

  useEffect(() => {
    if (isMemeCaption) {
      setSpinner(false)
    }
  }, [isMemeCaption])

  const triggerFileSelectPopup = () => {
    const inputElement = inputRef?.current
    if (inputElement) {
      inputElement.value = ""

      inputElement.click()
    }
  }

  return (
    <div className="w-full">
      <div className="text-center">
        <button
          className="bg-black text-white px-6 py-6 rounded-full text-lg drop-shadow-xl border-solid border-4 border-yellow-500 shadow-2xl hover:bg-white hover:text-black"
          onClick={() => {
            triggerFileSelectPopup()
          }}
        >
          <span>
            <Icons.camera className=" mx-auto" />
          </span>
        </button>
      </div>
      <Input
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleImageUpload}
        className="hidden"
        ref={inputRef}
      />
      {!image && (
        <div className="flex flex-wrap mt-4">
          <div className="w-full">
            <div className="relative text-center">
              <Image
                id="image-handler"
                src="/images/jeff_bezos_walking.jpeg"
                alt=""
                width="500"
                height="300"
                className="rounded-md drop-shadow-lg mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {image && (
        <>
          <div className="relative text-center">
            {!spinner && (
              <button
                className=" mt-4 bg-black text-white px-2 py-2 rounded-md text-lg overflow-hidden group drop-shadow-2xl border-solid border-2"
                onClick={() => {
                  getMemeCaption()
                }}
              >
                <Icons.refresh className="" />
              </button>
            )}

            <Image
              id="image-handler"
              src={image.src}
              alt="uploaded"
              width={500}
              height={500}
              ref={imageRef}
              onLoad={handleOnLoadImage}
              className={
                spinner ? "blur-sm" : "rounded-md shadow-lg mx-auto mt-4"
              }
            />
            {spinner && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full color-blue border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageHandler
