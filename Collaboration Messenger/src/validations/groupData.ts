/**
 * Validates the group data.
 * @param {string} groupName - The name of the group.
 * @param {string} groupDescription - The description of the group.
 * @returns {object} - An object containing error messages for invalid group data.
 */
export const checkGroupData = (groupName: string, groupDescription: string) => {
  const errors = {
    groupName: '',
    groupDescription: ''
  };
  if (!groupName) {
    errors.groupName = 'Group name is required';
  }
  else if (groupName.length < 4 || groupName.length > 16) {
    errors.groupName = 'Group name must be between 4 and 16 characters long';
  }
  if (!groupDescription) {
    errors.groupDescription = 'Group description is required';
  }
  else if (groupDescription.length < 8 || groupDescription.length > 32) {
    errors.groupDescription = 'Group description must be between 8 and 32 characters long';
  }
  return errors;
};