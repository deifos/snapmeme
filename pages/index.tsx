import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import confetti from "canvas-confetti"
import { saveAs } from "file-saver"
import html2canvas from "html2canvas"

import ImageHandler from "@/components/image-handler"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

declare global {
  interface Window {
    beam: any
  }
}

export default function IndexPage() {
  const scrollRef = useRef<null | HTMLDivElement>(null)

  const [imageDescription, setImageDescription] = useState("")
  const [caption, setCaption] = useState(
    "When you strut down the street knowing you just aced that job interview."
  )
  const [isMemeCaption, setMemeCaption] = useState(null)
  const confettiRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [combinedImage, setCombinedImage] = useState(null)
  const [open, setOpen] = useState(false)
  const [inputText, setInputText] = useState("")

  const updateImageDescription = (data) => {
    setImageDescription(data)
  }

  const handleDownload = () => {
    const imageHandlerElement = document.getElementById("image-handler")
    const captionElement = document.getElementById("caption")

    html2canvas(imageHandlerElement).then((canvas) => {
      const context = canvas.getContext("2d")

      // Calculate the desired canvas dimensions
      const imageRect = imageHandlerElement.getBoundingClientRect()
      const imageWidth = imageRect.width
      const imageHeight = imageRect.height
      const lineHeight = 30 // Adjust this value to control the line height
      const padding = 25 // Padding for the text
      const lines = getWrappedTextLines(
        captionElement.innerText,
        "bold 25px Arial",
        imageWidth - padding,
        context
      )
      const textWidth = lines.reduce(
        (maxWidth, line) => Math.max(maxWidth, context.measureText(line).width),
        0
      )
      const boxWidth = textWidth + 2 * padding
      const boxHeight = lines.length * lineHeight + 2 * padding
      const boxX = (imageWidth - boxWidth) / 2
      const boxY = imageHeight

      // Resize the canvas to match the image dimensions
      canvas.width = imageWidth
      canvas.height = imageHeight + boxHeight
      // Set the canvas background color to white
      context.fillStyle = "#FFF"
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the image on the canvas
      if (imageHandlerElement instanceof HTMLImageElement) {
        context.drawImage(imageHandlerElement, 0, 0, imageWidth, imageHeight)
      }

      // Draw the white box behind the text
      context.fillStyle = "#FFF" // Black box color
      context.fillRect(boxX, boxY, boxWidth, boxHeight)

      // Draw the caption text on top of the black box
      context.fillStyle = "#000" // White text color
      context.font = "bold 25px Arial" // Bold 25px Arial font
      lines.forEach((line, index) => {
        const textX = boxX + (boxWidth - context.measureText(line).width) / 2 // Center the text horizontally
        const textY = boxY + 50 + index * lineHeight
        context.fillText(line, textX, textY)
      })

      // Add the watermark
      context.font = "bold 12px Arial" // Watermark font
      context.fillStyle = "rgba(0, 0, 0, 0.5)" // Watermark color and transparency
      context.fillText("snapmeme.vercel.app", 10, canvas.height - 10) // Watermark text position

      // Convert the canvas to a data URL
      const combinedImageURL = canvas.toDataURL()

      // Set the combined image in the state variable
      setCombinedImage(combinedImageURL)

      // Trigger the download
      saveAs(combinedImageURL, "combined_image.png")
    })
  }

  //wrapped the text on the black box when generating the image
  function getWrappedTextLines(text: string, font: string, maxWidth: number, context: CanvasRenderingContext2D) {
    context.font = font
    const words = text.split(" ")
    const lines = []
    let currentLine = ""

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine + word + " "
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && i > 0) {
        lines.push(currentLine.trim())
        currentLine = word + " "
      } else {
        currentLine = testLine
      }
    }

    lines.push(currentLine.trim())
    return lines
  }

  const handleInputChange = (event) => {
    setInputText(event.target.value)
  }

  const getMemeCaption = async () => {
    setOpen(true)
  }

  const getCaption = async () => {
    setOpen(false)
    if (typeof window !== undefined) {
      window?.beam("/custome-events/generate_meme")
    }
    setCaption("")

    const payload = {
      imageDescription: imageDescription,
      context: inputText,
    }

    const response = await fetch("/api/get-meme-caption", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = response.body

    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false
    let captionText = ""

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      const chunkValue = decoder.decode(value)

      captionText += chunkValue
      setCaption(captionText)
      scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    if (done) {
      setMemeCaption(true)
      showConfetti()
      setIsGenerating(false)
    }
  }

  const showConfetti = () => {
    const canvas = document.createElement("canvas")
    const conf = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    })
    confetti()
  }

  useEffect(() => {
    if (imageDescription) {
      setMemeCaption(false)
      getMemeCaption()
    }
  }, [imageDescription])

  return (
    <Layout>
      <Head>
        <title>Snapmeme</title>
        <meta
          name="description"
          content="Snapmeme the laziest way to generate memes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid place-items-center gap-6 pt-6 pb-8 md:py-10 overflow-x-hidden">
        <div className="max-w-[980px] gap-2 text-center">
          <h1 className="text-3xl text-black font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl dark:text-white">
            Snapmeme - the laziest way to create memes
          </h1>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-10/12 bg-white dark:bg-black mt-16">
              <DialogHeader>
                <DialogTitle className="">Add context *optional*</DialogTitle>
                <DialogDescription className="text-lg">
                  Add context to your meme for instance: &quot;high price of
                  eggs&ldquo;.
                  <br />
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid items-center text-center">
                  <Input
                    id="name"
                    placeholder="the high price of eggs"
                    className="col-span-3"
                    value={inputText}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={getCaption}>Go</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p className="mt-4 text-lg text-black dark:text-white sm:text-xl">
            Upload or take a photo to create a meme in seconds.
          </p>
        </div>
        <div>
          <canvas
            ref={confettiRef}
            className="absolute top-0 left-0 w-100 height-100"
          />
          <div>
            <ImageHandler
              updateImageDescription={updateImageDescription}
              isMemeCaption={isMemeCaption}
              getMemeCaption={getMemeCaption}
            />
          </div>

          <p
            id="caption"
            className="text-xl font-bold  text-black text-center text-shadow-lg bg-white p-2 sm:w-2/3 lg:w-3/5 mx-auto"
          >
            {caption}
          </p>
          {isMemeCaption && (
            <p className="text-center">
              <button
                onClick={handleDownload}
                className=" bg-black text-white px-2 mt-3 py-2 rounded-md text-lg overflow-hidden group w-60 drop-shadow-2xl border-solid border-2"
              >
                Download
              </button>
            </p>
          )}
        </div>
      </section>
    </Layout>
  )
}
