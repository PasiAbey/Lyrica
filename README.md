# Lyrica - Lyrics Finder

Lyrica is a full-stack web application built and deployed using modern DevOps practices. This project demonstrates a complete CI/CD pipeline for a containerized application, deployed on a custom cloud infrastructure provisioned via Terraform.

---

## Project Overview

Lyrica consists of:
- **Frontend**: A user-facing web interface to search for lyrics.
- **Backend**: An API service that serves lyrics data.
- **Containerization**: Both frontend and backend are containerized using Docker.
- **CI/CD**: Automated build, test, and deployment pipeline using GitHub Actions.
- **Infrastructure as Code (IaC)**: Cloud infrastructure on AWS is managed by Terraform.

---

## Architecture

The architecture is designed to be modular, scalable, and maintainable, following best practices for cloud-native applications.

### Infrastructure Architecture

The entire infrastructure is provisioned on AWS using Terraform, ensuring that the environment is reproducible and version-controlled.

```mermaid
graph TD
    subgraph "AWS Cloud"
        subgraph "VPC"
            subgraph "Public Subnet"
                EC2_Instance[EC2 Instance]
            end
        end
    end

    subgraph "Networking"
        RT[Route Table]
        IGW[Internet Gateway]
    end

    subgraph "On EC2 Instance"
        subgraph "Docker"
            Frontend_Container[Frontend Container]
            Backend_Container[Backend Container]
            Docker_Network[Custom Docker Network]
        end
    end

    User -->|HTTPS| EC2_Instance
    EC2_Instance -->|Port 80| Frontend_Container
    Frontend_Container <-->|On Docker Network| Backend_Container
    
    PublicSubnet --> Public_Subnet
    Public_Subnet -- "Uses" --> RT
    RT -- "0.0.0.0/0" --> IGW
    IGW -- "Connects to" --> Internet[Internet]


    style VPC fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Public_Subnet fill:#e6f2ff,stroke:#333,stroke-width:1px
    style Networking fill:#f0f0f0,stroke:#333,stroke-width:1px
```

- **VPC**: A custom Virtual Private Cloud (VPC) provides an isolated network environment.
- **Public Subnet**: A single public subnet is created to host publicly accessible resources.
- **Internet Gateway (IGW)**: Allows communication between the VPC and the internet.
- **Route Table**: Directs traffic from the subnet to the Internet Gateway.
- **Security Group**: Acts as a virtual firewall, allowing inbound traffic on ports 22 (SSH), 80 (HTTP), and 3000 (Backend).
- **EC2 Instance**: A single EC2 instance is launched to host the Dockerized application.

Terraform modules are used for creating the VPC, Security Group, and EC2 instance, promoting reusability and clean code structure.

### CI/CD Pipeline

The CI/CD pipeline is orchestrated using **GitHub Actions**.

```mermaid
graph LR
    A[Push to main] --> B{GitHub Actions CI/CD};
    B --> C[Checkout Code];
    C --> D[Build Docker Images];
    D --> E[Push to Docker Hub];
    E --> F[Deploy to EC2];

    subgraph F
        direction LR
        F1[Configure AWS Credentials] --> F2[Run SSM Command];
    end
```

1.  **Trigger**: The workflow is triggered on a `push` to the `main` branch.
2.  **Build**: Docker images for the frontend and backend are built and tagged.
3.  **Push**: The newly built images are pushed to Docker Hub.
4.  **Deploy**: The deployment to the EC2 instance is handled by **AWS Systems Manager (SSM) Send-Command**. This approach is more secure than exposing SSH keys. The SSM command pulls the latest Docker images and restarts the containers.

---
