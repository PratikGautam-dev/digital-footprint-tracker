import {
  scanURLService,
  scanEmailService,
  scanFileService,
  scanIdentityService,
  scanFootprintService,
  getAllResultsService,
  getResultByIdService,
  getStatsService
} from '../services/scanService.js';

export const scanURLController = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }
    const result = await scanURLService(url);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const scanEmailController = async (req, res) => {
  try {
    const { emailText } = req.body;
    if (!emailText) {
      return res.status(400).json({ success: false, message: "Email text is required" });
    }
    const result = await scanEmailService(emailText);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const scanFileController = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: "Filename is required" });
    }
    const result = await scanFileService(filename);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const scanIdentityController = async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, message: "Input is required" });
    }
    const result = await scanIdentityService(input);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const scanFootprintController = async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, message: "Input is required" });
    }
    const result = await scanFootprintService(input);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getResultsController = async (req, res) => {
  try {
    const { limit } = req.query;
    const results = await getAllResultsService(limit);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getResultByIdController = async (req, res) => {
  try {
    const result = await getResultByIdService(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStatsController = async (req, res) => {
  try {
    const stats = await getStatsService();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
