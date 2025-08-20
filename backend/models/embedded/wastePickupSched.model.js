import mongoose from 'mongoose'

/**
 * Enumerate days of the week
 */
const DaysOfWeekEnum = Object.freeze({
  SUN   : 'sunday',
  MON   : 'monday',
  TUES  : 'tuesday',
  WED   : 'wednesday',
  THURS : 'thursday',
  FRI   : 'friday',
  SAT   : 'saturday'
});
/**
 * Enumerate desired frequencies
 */
const FreqEnum = Object.freeze({
  WEEKLY  : 'weekly',
  BIWEEKLY: 'biweekly' // every other week (not twice a week)
});
/**
 * Embedded schema that encapsulates information about trash pickup schedules.
 */
const wastePickupSchedSchema = new mongoose.Schema({
  /**
   * Trash pickup frequency
   */
  frequency: {
    type    : String,
    enum    : Object.values(FreqEnum), // TODO: add tooltip on frontend to specify that biweekly refers to every other week, not twice a week 
    required: [true, 'Waste pickup schedule frequency is required']
  },
  /**
   * Day(s) that trash is picked up
   */
  days: {
    type    : [String],
    enum    : Object.values(DaysOfWeekEnum),
    required: [true, 'Days of the week are required'],
    validate: {
      validator: function(days) {
        return [                                  // List of predicates to test
          Array.isArray(days),                    // Ensure input is an array
          days.length > 0,                        // Ensure at least 1 day
          (new Set(days)).size === days.length    // Ensure no duplicates
        ].every(predicate => predicate === true); // true if all predicates are true, else false
      },
      message: props => `Invalid days: ${props.value}`
    }
  }
}, { _id: false }); // No unique ObjectID for embedded schema
/**
 * Virtual field to get 'days' sorted in chronological order (as enumerated in DaysOfWeekEnum)
 */
wastePickupSchedSchema.virtual('sortedDays').get(function() {
  return this.days.slice().sort((a, b) => {
    return Object.values(DaysOfWeekEnum).indexOf(a) - Object.values(DaysOfWeekEnum).indexOf(b);
  });
});
/* Note: Access virtual fields like any other field in the schema; e.g.,
    const foo = new wastePickupSchedSchema({...}); 
    const freq = foo.frequency; 
    const days = foo.days; 
    const sortedDays = foo.sortedDays; */

export { wastePickupSchedSchema, FreqEnum, DaysOfWeekEnum }