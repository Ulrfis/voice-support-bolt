/*
  # Voice Support Tickets Schema

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key) - Auto-generated ticket ID
      - `created_at` (timestamptz) - Timestamp of ticket creation
      - `use_case` (text) - Use case identifier (it_support, ecommerce, saas, dev_portal)
      - `status` (text) - Ticket status (new, in_progress, waiting_customer, resolved, closed)
      - `priority` (text) - Priority level (critical, high, medium, low)
      - `category` (text) - Category based on use case
      - `tags` (text[]) - Array of tags for classification
      - `raw_transcript` (text) - Complete raw transcription
      - `email` (text) - Customer email address
      - `language` (text) - Language code (fr, en)
      
      IT Support fields:
      - `device` (text) - Device or component with issues
      - `symptoms` (text) - Description of the problem
      - `frequency` (text) - How often the issue occurs
      - `environment` (text) - System environment details
      - `actions_tried` (text) - Actions already attempted
      - `impact` (text) - Impact on user's work
      
      E-commerce fields:
      - `order_number` (text) - Order reference number
      - `problem_type` (text) - Type of problem encountered
      - `product_description` (text) - Description of the product
      - `delivery_status` (text) - Current delivery status
      - `desired_resolution` (text) - What customer wants
      - `purchase_date` (text) - Date of purchase
      
      SaaS fields:
      - `feature` (text) - Feature concerned
      - `steps_to_reproduce` (text) - Steps to reproduce the issue
      
      Dev Portal fields:
      - `request_type` (text) - Type of request (bug, enhancement, etc.)
      - `description` (text) - Detailed description
      - `urgency` (text) - Urgency level
      - `context` (text) - Additional context
      - `expected_behavior` (text) - Expected behavior
      - `ideas_needs` (text) - Ideas or needs

  2. Security
    - Enable RLS on `tickets` table
    - Add policy for public read access (demo purposes)
    - Add policy for public insert access (demo purposes)
    - Add policy for public update access (demo purposes)

  3. Important Notes
    - This is a demo application, so RLS policies are permissive
    - In production, these would be restricted to authenticated users
    - All enum values are stored in English
    - Transcript content is stored in original language
*/

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  use_case text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'medium',
  category text,
  tags text[] DEFAULT '{}',
  raw_transcript text,
  email text,
  language text DEFAULT 'fr',
  
  -- IT Support fields
  device text,
  symptoms text,
  frequency text,
  environment text,
  actions_tried text,
  impact text,
  
  -- E-commerce fields
  order_number text,
  problem_type text,
  product_description text,
  delivery_status text,
  desired_resolution text,
  purchase_date text,
  
  -- SaaS fields
  feature text,
  steps_to_reproduce text,
  
  -- Dev Portal fields
  request_type text,
  description text,
  urgency text,
  context text,
  expected_behavior text,
  ideas_needs text
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tickets"
  ON tickets
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert tickets"
  ON tickets
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update tickets"
  ON tickets
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tickets"
  ON tickets
  FOR DELETE
  TO anon
  USING (true);