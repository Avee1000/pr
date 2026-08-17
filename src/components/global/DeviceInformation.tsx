export async function getDeviceModel() {
  if ((navigator as any).userAgentData && (navigator as any).userAgentData.getHighEntropyValues) {
    try {
      const hints = await (navigator as any).userAgentData.getHighEntropyValues([
        'architecture',
        'model',
        'platform',
        'platformVersion',
        'fullVersionList',
        'bitness'
      ]);

      const fallbackName = hints.platform ? `${hints.platform} Device` : 'Unknown Model';
      const modelName = hints.model && hints.model.trim() !== '' ? hints.model : fallbackName;

      return {
        brandModel: modelName, // e.g., "Pixel 7", "SM-G998B"
        platform: `${hints.platform} ${hints.platformVersion}`, // e.g., "Android 14.0.0"
        architecture: `${hints.architecture}(${hints.bitness}-bit)` // e.g., "x86 (64-bit)"
      };
    } catch (e) {
      console.warn("High-entropy hints permission denied or failed", e);
    }
  }
  return null;
}