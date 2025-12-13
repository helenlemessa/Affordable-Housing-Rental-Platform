const crypto = require('crypto');

module.exports.generateResetToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  return { 
    resetToken, 
    hashedToken, 
    expireTime 
  };
};