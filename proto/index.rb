FileHeader = Struct.new(
  :magic_string,
  :version,
  :no_of_records,
)

Record = Struct.new(
  :type,
  :timestamp,
  :user_id,
  :amount,
)

class CustomProtocolFormat
  attr_reader :records

  TYPE_MAPPING = {
    "\x00": 'Debit',
    "\x01": 'Credit',
    "\x02": 'StartAutopay',
    "\x03": 'EndAutopay'
  }

  def initialize
    @records = []
  end

  def parse_file filename
    File.open(filename, "rb") do |file|
      # NOTE: All multi-byte fields are encoded in network byte order.
    
      # read 9 bytes, this is the size of file header
      binary = file.read(9)
    
      # decode binary data
      # A4 - magic_string, 4 bytes, "MPS7"
      # C - version, 1 byte
      # N - no_of_records, 4 bytes unsigned
      data = binary.unpack("A4 C N")
      file_header = FileHeader.new(*data)
      no_of_records = file_header.no_of_records
    
      no_of_records.times do
        binary = file.read(13)

        # a - type, 1 byte type enum (arbitrary binary string)
        # N - timestamp, 4 bytes unsigned
        # Q> - no_of_records, 8 bytes unsigned
        data = binary.unpack("a N Q>")
        data[0] = TYPE_MAPPING[data[0].to_sym]

        if (data[0] == 'Debit' || data[0] == 'Credit')
          binary = file.read(8)
          # G - no_of_records, 8 float
          data += binary.unpack("G")
        end
    
        record = Record.new(*data)
        @records << record
      end
    end
  end

  def question_n_answers
    question_one
    question_two
    question_three
    question_four
    question_five
  end

  def question_one
    puts 'What is the total amount in dollars of debits?'
    puts calculate_type_sum('Debit')
    puts "\n"
  end

  def question_two
    puts 'What is the total amount in dollars of credits?'
    puts calculate_type_sum('Credit')
    puts "\n"
  end

  def question_three
    puts 'How many autopays were started?'
    puts calculate_type_count('StartAutopay')
    puts "\n"
  end

  def question_four
    puts 'How many autopays were ended?'
    puts calculate_type_count('EndAutopay')
    puts "\n"
  end

  def question_five
    puts 'What is balance of user ID 2456938384156277127?'
    user_id = 2456938384156277127
    puts calculate_user_balance(user_id)
    puts "\n"
  end

  private

  def calculate_type_sum(type)
    @records.reduce(0) do |sum, record|
      if record.type == type
        sum += record.amount
      end

      sum
    end
  end

  def calculate_type_count(type)
    @records.select { |record| record.type == type }.length
  end

  def find_record_by_user_id(user_id)
    @records.select { |record| record.user_id == user_id }
  end

  def calculate_user_balance(user_id)
    records = find_record_by_user_id(user_id)

    records.reduce(0) do |sum, record|
      if record.type == 'Credit'
        sum + record.amount
      end
      if record.type == 'Debit'
        sum - record.amount
      end

      sum
    end
  end
end

filename = "txnlog.dat"
format = CustomProtocolFormat.new
format.parse_file filename
format.question_n_answers
