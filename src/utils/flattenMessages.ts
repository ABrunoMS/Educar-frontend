export function flattenMessages(nestedMessages: object, prefix = '') {
    return Object.keys(nestedMessages).reduce((messages, key) => {
      let value = nestedMessages[key as keyof typeof nestedMessages];
      let prefixedKey = prefix ? `${prefix}.${key}` : key;
  
      if (typeof value === 'string') {
        messages[prefixedKey as keyof typeof messages] = value;
      } else {
        Object.assign(messages, flattenMessages(value, prefixedKey));
      }
  
      return messages;
    }, {});
}