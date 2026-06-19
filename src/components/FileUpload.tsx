import { Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { isValidFileType, formatFileSize, getFileExtension } from '../utils/helpers'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  accept?: string
}

export function FileUpload({ onFileSelect, disabled = false, accept = '.pdf,.doc,.docx,.txt' }: FileUploadProps) {
  const handleFileChange = (info: { file: any }) => {
    const file = info.file.originFileObj || info.file
    
    if (!file || !(file instanceof File)) {
      message.error('请选择文件')
      return
    }
    
    if (!isValidFileType(file)) {
      message.error('不支持的文件格式，请上传PDF、Word、Excel或文本文件')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) {
      message.error('文件大小不能超过50MB')
      return
    }
    
    message.success(`已选择文件: ${file.name} (${getFileExtension(file.name)}) - ${formatFileSize(file.size)}`)
    onFileSelect(file)
  }
  
  return (
    <Upload.Dragger
      beforeUpload={() => false}
      onChange={handleFileChange}
      disabled={disabled}
      accept={accept}
      showUploadList={false}
    >
      <p className="ant-upload-drag-icon">
        <UploadOutlined style={{ fontSize: 48, color: '#1677ff' }} />
      </p>
      <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
      <p className="ant-upload-hint">支持 PDF、DOC、DOCX、TXT、XLS、XLSX 格式，最大50MB</p>
      <Button type="primary" ghost size="large" style={{ marginTop: 16 }}>
        选择文件
      </Button>
    </Upload.Dragger>
  )
}
