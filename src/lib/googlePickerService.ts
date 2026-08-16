/**
 * Google Picker & Google Docs API Service
 */

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface PickedGoogleFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  iconUrl?: string;
  sizeBytes?: number;
}

/**
 * Loads the Google Picker JavaScript API library dynamically
 */
export function loadGooglePickerApi(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.google && window.google.picker) {
      resolve(true);
      return;
    }

    const scriptId = 'google-picker-api-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://apis.google.com/js/api.js';
      document.body.appendChild(script);
    }

    const checkGapi = () => {
      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => resolve(true),
          onerror: () => resolve(false)
        });
      } else {
        setTimeout(checkGapi, 100);
      }
    };

    if ((script as any).complete || (script as any).readyState === 'complete') {
      checkGapi();
    } else {
      script.onload = () => checkGapi();
      script.onerror = () => resolve(false);
    }
  });
}

/**
 * Opens Google Picker modal UI for choosing files from Google Drive / Docs
 */
export async function showGooglePicker({
  accessToken,
  onPicked,
  onCancel,
  allowedMimeTypes
}: {
  accessToken: string;
  onPicked: (file: PickedGoogleFile) => void;
  onCancel?: () => void;
  allowedMimeTypes?: string;
}): Promise<boolean> {
  const loaded = await loadGooglePickerApi();
  if (!loaded || !window.google || !window.google.picker) {
    console.error('Failed to load Google Picker API');
    return false;
  }

  try {
    const pickerOrigin =
      window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
    if (allowedMimeTypes) {
      docsView.setMimeTypes(allowedMimeTypes);
    } else {
      docsView.setMimeTypes(
        'application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet,application/vnd.google-apps.presentation,application/pdf,text/plain'
      );
    }

    const uploadView = new window.google.picker.DocsUploadView();

    const builder = new window.google.picker.PickerBuilder()
      .addView(docsView)
      .addView(uploadView)
      .setOAuthToken(accessToken)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs?.[0];
          if (doc) {
            onPicked({
              id: doc.id,
              name: doc.name || doc.title || 'Untitled File',
              mimeType: doc.mimeType || 'application/vnd.google-apps.document',
              url: doc.url || doc.embedUrl || `https://docs.google.com/document/d/${doc.id}/edit`,
              iconUrl: doc.iconUrl,
              sizeBytes: doc.sizeBytes
            });
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          if (onCancel) onCancel();
        }
      })
      .setOrigin(pickerOrigin);

    const picker = builder.build();
    picker.setVisible(true);
    return true;
  } catch (err) {
    console.error('Error opening Google Picker:', err);
    return false;
  }
}

/**
 * Creates a new Google Doc using the Google Docs REST API
 */
export async function createGoogleDoc(accessToken: string, title: string): Promise<{
  id: string;
  name: string;
  url: string;
} | null> {
  try {
    const res = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to create Google Doc:', res.status, errText);
      return null;
    }

    const data = await res.json();
    return {
      id: data.documentId,
      name: data.title || title,
      url: `https://docs.google.com/document/d/${data.documentId}/edit`
    };
  } catch (err) {
    console.error('Error in createGoogleDoc:', err);
    return null;
  }
}

/**
 * Fetches content and structured structure from a Google Doc using the Docs REST API
 */
export async function fetchGoogleDocDetails(accessToken: string, docId: string): Promise<{
  id: string;
  title: string;
  bodyText: string;
  revisionId?: string;
  rawJson?: any;
} | null> {
  try {
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch Google Doc details:', res.status);
      return null;
    }

    const data = await res.json();
    let bodyText = '';

    if (data.body?.content) {
      for (const element of data.body.content) {
        if (element.paragraph?.elements) {
          for (const pe of element.paragraph.elements) {
            if (pe.textRun?.content) {
              bodyText += pe.textRun.content;
            }
          }
        }
      }
    }

    return {
      id: data.documentId,
      title: data.title || 'Untitled Document',
      bodyText: bodyText.trim(),
      revisionId: data.revisionId,
      rawJson: data
    };
  } catch (err) {
    console.error('Error fetching Google Doc details:', err);
    return null;
  }
}

/**
 * Inserts text into an existing Google Doc via batchUpdate API
 */
export async function appendTextToGoogleDoc(accessToken: string, docId: string, textToAppend: string): Promise<boolean> {
  try {
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              endOfSegmentLocation: {},
              text: `\n${textToAppend}`
            }
          }
        ]
      })
    });

    return res.ok;
  } catch (err) {
    console.error('Error appending text to Google Doc:', err);
    return false;
  }
}
