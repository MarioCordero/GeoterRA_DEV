package ucr.ac.cr.inii.geoterra.domain

/**
 * Utility class providing helper methods for string manipulation and numeric formatting.
 */
class Util {

	companion object {

		/**
		 * Truncates the decimal digits of a number contained within a [String] to a specified number
		 * of decimal places after the separator (either '.' or ',') using regular expressions.
		 *
		 * @param value The string containing the numeric value to be truncated.
		 * @param decimalPlaces The maximum number of decimal positions to keep after the separator.
		 * @return The string representation of the number truncated to [decimalPlaces] decimal places.
		 */
		fun truncateDecimal(value: String, decimalPlaces: Int): String {
			if (decimalPlaces < 0) return value

			val regex = if (decimalPlaces == 0) {
				"""(-?\d+)(?:[.,]\d+)?""".toRegex()
			} else {
				"""(-?\d+(?:[.,]\d{1,$decimalPlaces})?)\d*""".toRegex()
			}

			return regex.replace(value, "$1")
		}

		/**
		 * Truncates a [Double] value to a specified number of decimal places after the separator.
		 *
		 * @param value The double precision floating-point number to truncate.
		 * @param decimalPlaces The maximum number of decimal positions to keep after the separator.
		 * @return The string representation of the double truncated to [decimalPlaces] decimal places.
		 */
		fun truncateDecimal(value: Double, decimalPlaces: Int): String {
			return truncateDecimal(value.toString(), decimalPlaces)
		}
	}
}