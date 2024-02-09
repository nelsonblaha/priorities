function (doc) {
  if (doc._id && doc._id.indexOf('_design/') === 0) {
    return;
  }

  function calculateRepeatMilliseconds(repeatNumber, repeatUnit) {
    var milliseconds = 0;
    switch (repeatUnit) {
      case 'hours':
        milliseconds = repeatNumber * 3600000; break;
      case 'days':
        milliseconds = repeatNumber * 86400000; break;
      case 'weeks':
        milliseconds = repeatNumber * 604800000; break;
      case 'months':
        milliseconds = repeatNumber * 2592000000; break;
      case 'years':
        milliseconds = repeatNumber * 31536000000; break;
      default:
        milliseconds = 0;
    }
    return milliseconds;
  }
  if (doc.description) {
    index('description', doc.description);
  }
  var visible_at = 0;
  if (doc.repeat_mode === 'after-completion' && doc.repeat_number && doc.repeat_unit && doc.completions && doc.completions.length > 0) {
    var lastCompletion = doc.completions[doc.completions.length - 1].completed_at;
    var lastCompletionTime = new Date(lastCompletion).getTime();
    var repeatInMilliseconds = calculateRepeatMilliseconds(doc.repeat_number, doc.repeat_unit);
    visible_at = lastCompletionTime + repeatInMilliseconds;
  }
  index('visible_at', visible_at, {store: true});
}