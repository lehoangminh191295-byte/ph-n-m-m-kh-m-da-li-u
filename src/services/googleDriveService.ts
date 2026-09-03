/**
 * Google Drive API v3 Client Service for Dermacare AI
 * Handles file listing, cloud backup, folder management, download, and file deletion.
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  description?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface DriveQuotaInfo {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
  userEmail?: string;
  userName?: string;
  userPhoto?: string;
}

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
export const DEFAULT_CLINIC_FOLDER = 'Dermacare AI - Ho So Benh An & Dermoscopy';

/**
 * Get user profile and storage quota on Google Drive
 */
export async function getDriveAboutInfo(accessToken: string): Promise<DriveQuotaInfo | null> {
  try {
    const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Failed to get Drive about info:', err);
      return null;
    }

    const data = await res.json();
    return {
      limit: data.storageQuota?.limit,
      usage: data.storageQuota?.usage,
      usageInDrive: data.storageQuota?.usageInDrive,
      usageInDriveTrash: data.storageQuota?.usageInDriveTrash,
      userEmail: data.user?.emailAddress,
      userName: data.user?.displayName,
      userPhoto: data.user?.photoLink,
    };
  } catch (err) {
    console.error('Error fetching drive about info:', err);
    return null;
  }
}

/**
 * Search or create a dedicated clinic folder on Google Drive
 */
export async function getOrCreateFolder(
  accessToken: string,
  folderName: string = DEFAULT_CLINIC_FOLDER
): Promise<string> {
  // 1. Search for existing folder
  const query = encodeURIComponent(`name='${folderName}' and mimeType='${FOLDER_MIME_TYPE}' and trashed=false`);
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // 2. Folder does not exist, create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: FOLDER_MIME_TYPE,
      description: 'Thư mục lưu trữ tự động hồ sơ bệnh án da liễu & dermoscopy của Dermacare AI',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(`Không thể tạo thư mục trên Google Drive: ${err.error?.message || createRes.statusText}`);
  }

  const created = await createRes.json();
  return created.id;
}

/**
 * List files inside the clinic folder on Google Drive
 */
export async function listClinicDriveFiles(
  accessToken: string,
  folderId?: string
): Promise<DriveFileItem[]> {
  try {
    let q = 'trashed=false';
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,description,webViewLink,iconLink)&orderBy=modifiedTime desc&pageSize=50`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Không thể tải danh sách tệp từ Google Drive');
    }

    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Error listing files from Google Drive:', error);
    throw error;
  }
}

/**
 * Upload JSON payload (e.g. database backup or patient export) to Google Drive
 */
export async function uploadJsonToDrive(
  accessToken: string,
  fileName: string,
  data: any,
  folderId?: string,
  description?: string
): Promise<DriveFileItem> {
  const boundary = '-------DermacareClinicDriveBoundary' + Date.now().toString(16);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: description || 'Dermacare AI Clinic Database Backup',
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    jsonString +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Tải lên Google Drive thất bại: ${err.error?.message || res.statusText}`);
  }

  return await res.json();
}

/**
 * Upload a binary file (e.g. Dermoscopy image JPEG/PNG or PDF) to Google Drive
 */
export async function uploadBinaryFileToDrive(
  accessToken: string,
  file: File,
  folderId?: string,
  description?: string
): Promise<DriveFileItem> {
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    description: description || `Ảnh tổn thương / tài liệu Dermacare AI (${file.name})`,
    ...(folderId ? { parents: [folderId] } : {}),
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json; charset=UTF-8' })
  );
  form.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Tải tệp lên Google Drive thất bại: ${err.error?.message || res.statusText}`);
  }

  return await res.json();
}

/**
 * Download a file's content from Google Drive
 */
export async function downloadDriveFileContent(
  accessToken: string,
  fileId: string
): Promise<any> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Không thể tải nội dung tệp (Mã lỗi ${res.status})`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return await res.text();
}

/**
 * Delete a file from Google Drive
 * (Caller MUST prompt user confirmation beforehand per Workspace guidelines)
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Xóa tệp thất bại: ${err.error?.message || res.statusText}`);
  }
}
