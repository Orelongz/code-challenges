require 'csv'
require 'pry'

class SLCSP
  def initialize
    @zipcodes = []
    @silver_plans = {}
    @zips_result = {}
  end

  def retrieve_zipcodes
    slcsp_csv_file = "slcsp.csv"
    read_csv_file(slcsp_csv_file) do |row|
      @zipcodes << Hash[row]['zipcode']
    end
  end

  def compile_silver_plans
    plans_csv_file = "plans.csv"
    read_csv_file(plans_csv_file) do |row|
      if (Hash[row]['metal_level'] == 'Silver')
        data = Hash[row]
        unless @silver_plans[data['rate_area']]
          @silver_plans[data['rate_area']] = []
        end

        @silver_plans[data['rate_area']] << data['rate']
      end
    end
  end

  def get_plan_for_listed_zipcode
    zip_csv_file = "zips.csv"
    read_csv_file(zip_csv_file) do |row|
      data = Hash[row]
      unless @silver_plans[data['rate_area']].empty?
        @zips_result[data['zipcode']] = @silver_plans[data['rate_area']]
      end
    end
  end

  def write_to_stdout
    puts "zipcode,rate"
    @zipcodes.each do |zipcode|
      if @zips_result[zipcode]
        puts "#{zipcode},#{@zips_result[zipcode].uniq.min(2)[1]}"
      end
    end
  end

  def calculate
    retrieve_zipcodes
    compile_silver_plans
    get_plan_for_listed_zipcode
    write_to_stdout
  end

  private

  def read_csv_file(filename, &block)
    CSV.foreach(filename, headers: true, &block)
  end
end

SLCSP.new.calculate
