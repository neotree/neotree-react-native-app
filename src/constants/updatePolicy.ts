export const UPDATE_POLICY_SCHEMA = {
  $id: 'neotree.update-policy',
  type: 'object',
  properties: {
    data: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          required: ['runtimeVersion', 'policyVersion', 'ota', 'apk'],
          properties: {
            runtimeVersion: { type: 'string' },
            policyVersion: { type: 'integer' },
            ota: {
              type: 'object',
              required: ['enabled', 'channel'],
              properties: {
                enabled: { type: 'boolean' },
                channel: { type: 'string' },
              },
            },
            apk: {
              type: 'object',
              required: ['autoDownload', 'forceInstall'],
              properties: {
                autoDownload: { type: 'boolean' },
                forceInstall: { type: 'boolean' },
                gracePeriodHours: { type: ['integer', 'null'] },
                forceAfter: { type: ['string', 'null'] },
                installWindow: { type: ['string', 'null'] },
                messageTitle: { type: ['string', 'null'] },
                messageBody: { type: ['string', 'null'] },
              },
            },
            currentApkRelease: { $ref: '#/$defs/apkRelease' },
            rollbackApkRelease: { $ref: '#/$defs/apkRelease' },
          },
        },
      ],
    },
    errors: { type: 'array', items: { type: 'string' } },
  },
  $defs: {
    apkRelease: {
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          required: [
            'apkReleaseId',
            'runtimeVersion',
            'versionName',
            'versionCode',
            'status',
            'isAvailable',
            'available',
          ],
          properties: {
            apkReleaseId: { type: 'string' },
            runtimeVersion: { type: 'string' },
            versionName: { type: 'string' },
            versionCode: { type: 'integer' },
            status: {
              type: 'string',
              enum: [
                'uploaded',
                'validated',
                'approved',
                'available',
                'deprecated',
                'revoked',
                'rolled_back',
              ],
            },
            isAvailable: { type: 'boolean' },
            available: { type: 'boolean' },
            fileId: { type: ['string', 'null'] },
            fileSize: { type: ['integer', 'null'] },
            checksumSha256: { type: ['string', 'null'] },
            signatureSha256: { type: ['string', 'null'] },
            validatedAt: { type: ['string', 'null'] },
            approvedAt: { type: ['string', 'null'] },
            releaseNotes: { type: ['string', 'null'] },
            releasedAt: { type: ['string', 'null'] },
            downloadUrl: { type: ['string', 'null'] },
          },
        },
      ],
    },
  },
};

export const UPDATE_POLICY_EXAMPLE = {
  data: {
    runtimeVersion: 'neotree-1.0.0-dev',
    policyVersion: 3,
    ota: {
      enabled: true,
      channel: 'production',
    },
    apk: {
      autoDownload: true,
      forceInstall: false,
      gracePeriodHours: 24,
      forceAfter: null,
      installWindow: 'on_restart',
      messageTitle: 'Update required',
      messageBody: 'A new version is available. Please contact your administrator.',
    },
    currentApkRelease: {
      apkReleaseId: '00000000-0000-0000-0000-000000000001',
      runtimeVersion: 'neotree-1.0.0-dev',
      versionName: '2.6.0',
      versionCode: 20600,
      status: 'available',
      isAvailable: true,
      available: true,
      fileId: '00000000-0000-0000-0000-000000000010',
      fileSize: 12345678,
      checksumSha256: 'sha256hex',
      signatureSha256: 'sigsha256hex',
      validatedAt: '2026-02-02T00:00:00.000Z',
      approvedAt: '2026-02-02T01:00:00.000Z',
      releaseNotes: 'Bug fixes and improvements.',
      releasedAt: '2026-02-02T02:00:00.000Z',
      downloadUrl: 'https://example.org/api/files/00000000-0000-0000-0000-000000000010/download',
    },
    rollbackApkRelease: null,
  },
  errors: [],
};
