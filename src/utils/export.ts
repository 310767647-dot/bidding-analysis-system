import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export type ExportFormat = 'word' | 'pdf' | 'image'

export interface ExportOptions {
  format: ExportFormat
  filename: string
}

export async function exportToImage(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })

  const imageData = canvas.toDataURL('image/png', 1.0)
  const link = document.createElement('a')
  link.href = imageData
  link.download = `${filename}.png`
  link.click()
}

export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: '#ffffff'
  })

  const imgData = canvas.toDataURL('image/png', 1.0)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = canvas.width
  const imgHeight = canvas.height

  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const finalWidth = imgWidth * ratio
  const finalHeight = imgHeight * ratio

  const x = (pdfWidth - finalWidth) / 2
  const y = 0

  pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
  pdf.save(`${filename}.pdf`)
}

export async function exportToWord(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })

  const imgData = canvas.toDataURL('image/png', 1.0)

  const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40"
xml:lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${filename}</title>
<style>
@page {
  size: 210mm 297mm;
  margin: 10mm;
}
body {
  font-family: "Microsoft YaHei", SimSun, sans-serif;
  font-size: 12pt;
  margin: 0;
  padding: 0;
}
img {
  width: 100%;
  height: auto;
}
</style>
</head>
<body>
<img src="${imgData}" />
</body>
</html>`

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.doc`
  link.click()

  setTimeout(() => URL.revokeObjectURL(link.href), 100)
}

export async function exportReport(element: HTMLElement, options: ExportOptions): Promise<void> {
  const { format, filename } = options

  try {
    switch (format) {
      case 'image':
        await exportToImage(element, filename)
        break
      case 'pdf':
        await exportToPDF(element, filename)
        break
      case 'word':
        await exportToWord(element, filename)
        break
      default:
        throw new Error(`不支持的格式: ${format}`)
    }
  } catch (error) {
    console.error('导出失败:', error)
    throw error
  }
}
