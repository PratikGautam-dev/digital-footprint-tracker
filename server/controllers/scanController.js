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

const textInput = (value) => typeof value === 'string' ? value.trim() : '';

const handleError = (res, error) => {
  console.error(error);
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Unable to complete the scan',
  });
};

export const scanURLController = async (req, res) => {
  try {
    const url = textInput(req.body?.url);
    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }
    const result = await scanURLService(url);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const scanEmailController = async (req, res) => {
  try {
    const emailText = textInput(req.body?.emailText);
    if (!emailText) {
      return res.status(400).json({ success: false, message: "Email text is required" });
    }
    const result = await scanEmailService(emailText);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const scanFileController = async (req, res) => {
  try {
    const filename = textInput(req.body?.filename);
    if (!filename) {
      return res.status(400).json({ success: false, message: "Filename is required" });
    }
    const result = await scanFileService(filename);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const scanIdentityController = async (req, res) => {
  try {
    const input = textInput(req.body?.input);
    if (!input) {
      return res.status(400).json({ success: false, message: "Input is required" });
    }
    const result = await scanIdentityService(input);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const scanFootprintController = async (req, res) => {
  try {
    const input = textInput(req.body?.input);
    if (!input) {
      return res.status(400).json({ success: false, message: "Input is required" });
    }
    const result = await scanFootprintService(input);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getResultsController = async (req, res) => {
  try {
    const { limit } = req.query;
    const results = await getAllResultsService(limit);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return handleError(res, error);
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
    return handleError(res, error);
  }
};

export const getStatsController = async (req, res) => {
  try {
    const stats = await getStatsService();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return handleError(res, error);
  }
};
