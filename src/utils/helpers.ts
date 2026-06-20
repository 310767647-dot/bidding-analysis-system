export function getRiskLevelConfig(level: string) {
  const configs: { [key: string]: { color: string; bgColor: string; text: string } } = {
    high: { color: '#dc2626', bgColor: '#fee2e2', text: '高风险' },
    medium: { color: '#d97706', bgColor: '#fef3c7', text: '中风险' },
    low: { color: '#059669', bgColor: '#d1fae5', text: '低风险' },
    none: { color: '#6b7280', bgColor: '#f3f4f6', text: '无风险' }
  }
  return configs[level] || configs.none
}

export function getPriorityConfig(priority: string) {
  const configs: { [key: string]: { color: string; bgColor: string; text: string } } = {
    high: { color: '#dc2626', bgColor: '#fee2e2', text: '高优先级' },
    medium: { color: '#d97706', bgColor: '#fef3c7', text: '中优先级' },
    low: { color: '#059669', bgColor: '#d1fae5', text: '低优先级' }
  }
  return configs[priority] || configs.medium
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidFileType(file: File): boolean {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  const allowedExtensions = ['.pdf', '.docx', '.txt', '.xlsx']
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase() || ''
  
  return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || ''
}
