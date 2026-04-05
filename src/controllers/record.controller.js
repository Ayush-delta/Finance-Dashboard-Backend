const recordService = require('../services/record.service');
const response = require('../utils/response');

const getAllRecords = async (req, res, next) => {
  try {
    const { records, pagination } = await recordService.getAllRecords(req.query);
    return response.paginated(res, records, pagination);
  } catch (err) {
    next(err);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return response.success(res, record);
  } catch (err) {
    next(err);
  }
};

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user);
    return response.created(res, record, 'Financial record created.');
  } catch (err) {
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body, req.user);
    return response.success(res, record, 'Financial record updated.');
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.softDeleteRecord(req.params.id, req.user);
    return response.success(res, null, 'Financial record deleted (soft).');
  } catch (err) {
    next(err);
  }
};

const hardDeleteRecord = async (req, res, next) => {
  try {
    await recordService.hardDeleteRecord(req.params.id);
    return response.success(res, null, 'Financial record permanently deleted.');
  } catch (err) {
    next(err);
  }
};

const getDeletedRecords = async (req, res, next) => {
  try {
    const { records, pagination } = await recordService.getDeletedRecords(req.query);
    return response.paginated(res, records, pagination);
  } catch (err) {
    next(err);
  }
};

const restoreRecord = async (req, res, next) => {
  try {
    const record = await recordService.restoreRecord(req.params.id);
    return response.success(res, record, 'Financial record restored.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  hardDeleteRecord,
  getDeletedRecords,
  restoreRecord,
};
