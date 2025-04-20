-- Create database if not exists
CREATE DATABASE IF NOT EXISTS insurance_claims;
USE insurance_claims;

-- Vehicle types enum table
CREATE TABLE vehicle_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name ENUM('2-wheeler', '3-wheeler', '4-wheeler') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claim status enum table
CREATE TABLE claim_status (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name ENUM('new', 'pending', 'approved', 'rejected') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incident types enum table
CREATE TABLE incident_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name ENUM('collision', 'theft', 'vandalism', 'fire', 'natural', 'mechanical') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims table
CREATE TABLE claims (
    claim_id CHAR(12) PRIMARY KEY,
    uuid CHAR(12) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    vehicle_type_id INT NOT NULL,
    vehicle_brand VARCHAR(100) NOT NULL,
    vehicle_description TEXT,
    incident_type_id INT NOT NULL,
    incident_date DATE NOT NULL,
    status_id INT NOT NULL,
    -- estimated_cost DECIMAL(10, 2) NOT NULL,
    damage_photo_url VARCHAR(255) NOT NULL,
    result_photo_url VARCHAR(255),
    damage_assessment JSON,
    damage_severity VARCHAR(50),
    damage_estimated_cost DECIMAL(10, 2),
    damage_repair_time VARCHAR(50),
    damage_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(type_id),
    FOREIGN KEY (incident_type_id) REFERENCES incident_types(type_id),
    FOREIGN KEY (status_id) REFERENCES claim_status(status_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status_id (status_id),
    INDEX idx_policy_number (policy_number)
);

-- Claim actions table
CREATE TABLE claim_actions (
    action_id INT PRIMARY KEY AUTO_INCREMENT,
    claim_id CHAR(12) NOT NULL,
    action_type ENUM('approve', 'reject') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE,
    INDEX idx_claim_id (claim_id)
);

-- Insert initial vehicle types
INSERT INTO vehicle_types (type_name) VALUES
('2-wheeler'),
('3-wheeler'),
('4-wheeler');

-- Insert initial claim status
INSERT INTO claim_status (status_name) VALUES
('new'),
('pending'),
('approved'),
('rejected');

-- Insert initial incident types
INSERT INTO incident_types (type_name) VALUES
('collision'), 
('theft'), 
('vandalism'), 
('fire'), 
('natural'), 
('mechanical');

-- Create trigger to update claim status to 'new' if claim is 2 days old
DELIMITER //
CREATE TRIGGER update_claim_status
BEFORE UPDATE ON claims
FOR EACH ROW
BEGIN
    IF DATEDIFF(NOW(), OLD.created_at) <= 2 THEN
        SET NEW.status_id = (SELECT status_id FROM claim_status WHERE status_name = 'new');
    ELSE
        SET NEW.status_id = (SELECT status_id FROM claim_status WHERE status_name = 'pending');
    END IF;
END //
DELIMITER ;