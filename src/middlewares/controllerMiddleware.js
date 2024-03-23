function validateFields(fields) {
  for (const field of fields) {
    if (!field.key) {
      return field.message;
    }
    }

  return null;
}

module.exports = {
  validateFields,
};
