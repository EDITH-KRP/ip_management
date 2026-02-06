import axios from "axios";
import FormData from "form-data";

class FilebaseStorage {
  constructor() {
    this.apiKey = process.env.FILEBASE_API_KEY;
    this.apiSecret = process.env.FILEBASE_API_SECRET;
    this.gatewayUrl = "https://ipfs.filebase.io/ipfs";

    if (!this.apiKey || !this.apiSecret) {
      throw new Error("FILEBASE_API_KEY and FILEBASE_API_SECRET are required");
    }

    // Base64 encode credentials for Basic Auth
    this.auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");
  }

  async uploadFile(fileBuffer, fileName) {
    try {
      const formData = new FormData();
      formData.append("file", fileBuffer, fileName);

      const response = await axios.post("https://api.filebase.io/v1/ipfs/upload", formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Basic ${this.auth}`
        }
      });

      const cid = response.data.cid;
      return {
        cid,
        gatewayUrl: `${this.gatewayUrl}/${cid}`,
        fileName,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Filebase upload error:", error.response?.data || error.message);
      throw new Error(`Failed to upload to Filebase: ${error.message}`);
    }
  }

  async retrieveFile(cid) {
    try {
      const gatewayUrl = `${this.gatewayUrl}/${cid}`;
      const response = await axios.get(gatewayUrl);
      return response.data;
    } catch (error) {
      console.error("Filebase retrieval error:", error.message);
      throw new Error(`Failed to retrieve from Filebase: ${error.message}`);
    }
  }

  getGatewayUrl(cid) {
    return `${this.gatewayUrl}/${cid}`;
  }
}

export default FilebaseStorage;
